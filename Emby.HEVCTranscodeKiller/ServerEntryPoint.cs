using System;
using System.Linq;
using System.Threading;
using MediaBrowser.Controller.Configuration;
using MediaBrowser.Controller.Library;
using MediaBrowser.Controller.Plugins;
using MediaBrowser.Controller.Session;
using MediaBrowser.Model.Configuration;
using MediaBrowser.Model.Logging;
using MediaBrowser.Model.Querying;
using MediaBrowser.Model.Serialization;
using MediaBrowser.Model.Session;

namespace Emby.HEVCTranscodeKiller;

public class ServerEntryPoint : IServerEntryPoint
{
    public ServerEntryPoint(ISessionManager sessionManager,
                            IUserManager userManager,
                            ILogManager logManager,
                            IServerConfigurationManager configManager)
    {
        SessionManager = sessionManager;
        UserManager    = userManager;
        ConfigManager  = configManager;
        Log            = logManager.GetLogger(Plugin.Instance.Name);
    }

    private ISessionManager SessionManager { get; }

    private IUserManager UserManager { get; }

    private IServerConfigurationManager ConfigManager { get; }

    private ILogger Log { get; }

    public void Dispose()
    {
        SessionManager.PlaybackStart    -= PlaybackStart;
        SessionManager.PlaybackStopped  -= PlaybackStopped;
        SessionManager.PlaybackProgress -= PlaybackProgress;
    }

    public void Run()
    {
        SessionManager.PlaybackStart    += PlaybackStart;
        SessionManager.PlaybackStopped  += PlaybackStopped;
        SessionManager.PlaybackProgress += PlaybackProgress;

        Plugin.Instance.UpdateConfiguration(Plugin.Instance.Configuration);
    }

    /// <summary>
    ///     Executed on a playback started Emby event.
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    private void PlaybackStart(object sender, PlaybackProgressEventArgs e)
    {
        Log.Info($"Kill Audio: {Plugin.Instance.Configuration.EnableKillingOfAudio}, Kill Video: {Plugin.Instance.Configuration.EnableKillingOfVideo}");
        if (e.Session.TranscodingInfo != null)
        {
            if (Plugin.Instance.Configuration.EnableAudioTranscodeNags && e.Session.TranscodingInfo.IsAudioDirect == false||
                Plugin.Instance.Configuration.EnableVideoTranscodeNags && e.Session.TranscodingInfo.IsVideoDirect == false)
                NagSessionHelper.AddSessionToList(e.Session.Id, Log, true);
            
            var mediaSourceItem = e.Session.FullNowPlayingItem.GetMediaSources(false, false, new LibraryOptions())
                                   .SingleOrDefault(x => string.Equals(x.Id, e.MediaSourceId,
                                                                       StringComparison.OrdinalIgnoreCase));

            if (mediaSourceItem == null) return;

            if (Plugin.Instance.Configuration.ExcludedLibraries != null &&
                Plugin.Instance.Configuration.ExcludedLibraries.Any())
                foreach (var excludedLibrary in Plugin.Instance.Configuration.ExcludedLibraries)
                    if (mediaSourceItem.Path.ToLower()
                                       .Contains(excludedLibrary.ToLower()))
                    {
                        Log.Info($"File in excluded directory {excludedLibrary} : {mediaSourceItem.Path} ignored killing.");
                        return;
                    }

            Log.Info($"Is Direct Audio: {e.Session.TranscodingInfo.IsAudioDirect}, Is Direct Video: {e.Session.TranscodingInfo.IsVideoDirect}, Video Codec: {mediaSourceItem.VideoStream.Codec}");

            if (Plugin.Instance.Configuration.EnableKillingOfAudio &&
                Plugin.Instance.Configuration.EnableKillingOfVideo && !e.Session.TranscodingInfo.IsAudioDirect &&
                !e.Session.TranscodingInfo.IsVideoDirect && mediaSourceItem.VideoStream.Codec.ToLower() == "hevc")
            {
                Log.Info("Kill Both");

                var msg = string.IsNullOrEmpty(Plugin.Instance.Configuration.MessageForBoth)
                    ? "Transcoding of video & audio is prohibited."
                    : Plugin.Instance.Configuration.MessageForBoth;

                StopAndSendMessage(e.Session.Id, msg);
                return;
            }

            if (Plugin.Instance.Configuration.EnableKillingOfVideo && !e.Session.TranscodingInfo.IsVideoDirect &&
                mediaSourceItem.VideoStream.Codec.ToLower() == "hevc")
            {
                Log.Info("Kill Video");

                var msg = string.IsNullOrEmpty(Plugin.Instance.Configuration.MessageForVideoOnly)
                    ? "Transcoding of video is prohibited."
                    : Plugin.Instance.Configuration.MessageForVideoOnly;

                StopAndSendMessage(e.Session.Id, msg);
                return;
            }

            if (Plugin.Instance.Configuration.EnableKillingOfAudio && !e.Session.TranscodingInfo.IsAudioDirect &&
                mediaSourceItem.VideoStream.Codec.ToLower() == "hevc")
            {
                Log.Info("Kill Audio");

                var msg = string.IsNullOrEmpty(Plugin.Instance.Configuration.MessageForAudioOnly)
                    ? "Transcoding of audio is prohibited."
                    : Plugin.Instance.Configuration.MessageForAudioOnly;

                StopAndSendMessage(e.Session.Id, msg);
                return;
            }
        }
    }

    /// <summary>
    ///     Executed on a playback progress Emby event.
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    private void PlaybackProgress(object sender, PlaybackProgressEventArgs e)
    {
        Log.Info($"In PlaybackProgress - Is Object Pause {e.IsPaused}");
        if (e.IsPaused && Plugin.Instance.Configuration.EnableKillingOfPausedVideo)
        {
            PausedSessionHelper.AddSessionToList(e.Session.Id, Log);

            var sessionsToKill = PausedSessionHelper.GetSessionsToKill();

            foreach (var pausedSession in sessionsToKill)
                StopAndSendMessage(pausedSession.SessionId, Plugin.Instance.Configuration.MessageForPausedVideo);
        }
        
        if (Plugin.Instance.Configuration.EnableAudioTranscodeNags ||
            Plugin.Instance.Configuration.EnableVideoTranscodeNags)
        {
            NagSessionHelper.AddSessionToList(e.Session.Id, Log);

            var sessionsToNag = NagSessionHelper.GetSessionsToNag();

            foreach (var nagSession in sessionsToNag) SendNagMessage(nagSession.SessionId);
        }
    }

    private void SendNagMessage(string sessionId)
    {
        var msg = "You are transcoding";

        if (Plugin.Instance.Configuration.EnableAudioTranscodeNags &&
            Plugin.Instance.Configuration.EnableVideoTranscodeNags)
            msg = string.IsNullOrEmpty(Plugin.Instance.Configuration.MessageForBothNags)
                ? "You are transcoding audio and video."
                : Plugin.Instance.Configuration.MessageForBothNags;
        else if (Plugin.Instance.Configuration.EnableAudioTranscodeNags &&
                 !Plugin.Instance.Configuration.EnableVideoTranscodeNags)
            msg = string.IsNullOrEmpty(Plugin.Instance.Configuration.MessageForAudioOnlyNags)
                ? "You are transcoding audio."
                : Plugin.Instance.Configuration.MessageForAudioOnlyNags;
        else if (!Plugin.Instance.Configuration.EnableAudioTranscodeNags &&
                 Plugin.Instance.Configuration.EnableVideoTranscodeNags)
            msg = string.IsNullOrEmpty(Plugin.Instance.Configuration.MessageForVideoOnlyNags)
                ? "You are transcoding video."
                : Plugin.Instance.Configuration.MessageForVideoOnlyNags;

        SessionManager.SendMessageCommand(null, sessionId, new MessageCommand
                                                           {
                                                               Header    = msg,
                                                               Text      = msg,
                                                               TimeoutMs = 10000
                                                           }, new CancellationToken());

        NagSessionHelper.RemoveSessionFromList(sessionId);
        NagSessionHelper.AddSessionToList(sessionId, Log);
    }

    private void StopAndSendMessage(string sessionId, string msg)
    {
        SessionManager.SendPlaystateCommand(null, sessionId, new PlaystateRequest
                                                             {
                                                                 Command = PlaystateCommand.Stop,
                                                                 ControllingUserId = UserManager.GetUsers(new UserQuery(){IsAdministrator = true}).Items
                                                                     .FirstOrDefault()
                                                                     ?.Id.ToString()
                                                             }, new CancellationToken());

        SessionManager.SendMessageCommand(null, sessionId, new MessageCommand
                                                           {
                                                               Header    = msg,
                                                               Text      = msg,
                                                               TimeoutMs = 10000
                                                           }, new CancellationToken());
    }

    /// <summary>
    ///     Executed on a playback stopped Emby event.
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    private void PlaybackStopped(object sender, PlaybackStopEventArgs e)
    {
        PausedSessionHelper.RemoveSessionFromList(e.Session.Id);
        NagSessionHelper.RemoveSessionFromList(e.Session.Id);
    }
}