using System;
using System.Collections.Generic;
using System.Linq;
using MediaBrowser.Model.Logging;

namespace Emby.HEVCTranscodeKiller;

public static class PausedSessionHelper
{
    private static List<PausedSession> PausedSessions { get; set; }

    public static void AddSessionToList(string sessionId, ILogger logger)
    {
        var duration                                                   = 5;
        if (Plugin.Instance.Configuration.PausedDuration > 0) duration = Plugin.Instance.Configuration.PausedDuration;

        logger.Info($"Paused Duration Set To {duration}");

        PausedSessions ??= new List<PausedSession>();

        if (!PausedSessions.Select(x => x.SessionId)
                           .Contains(sessionId))
        {
            logger.Info($"Added sessionId {sessionId} to list.");
            PausedSessions.Add(new PausedSession
                               {
                                   SessionId       = sessionId,
                                   PausedAtTimeUtc = DateTime.UtcNow,
                                   KillAtTimeUtc   = DateTime.UtcNow.AddMinutes(duration)
                               });
        }
    }

    public static void RemoveSessionFromList(string sessionId)
    {
        PausedSessions ??= new List<PausedSession>();

        PausedSessions.RemoveAll(x => x.SessionId == sessionId);
    }

    public static List<PausedSession> GetSessionsToKill()
    {
        PausedSessions ??= new List<PausedSession>();

        var output = PausedSessions.Where(x => x.KillAtTimeUtc <= DateTime.UtcNow)
                                   .ToList();

        return output;
    }
}