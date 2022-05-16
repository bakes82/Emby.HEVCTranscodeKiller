using System;
using System.Collections.Generic;
using System.Linq;
using MediaBrowser.Model.Logging;

namespace Emby.HEVCTranscodeKiller;

public static class NagSessionHelper
{
    private static List<NagSession> NagSessions { get; set; }

    public static void AddSessionToList(string sessionId, ILogger logger, bool addNow = false)
    {
        var duration                                                   = 5;
        if (Plugin.Instance.Configuration.NagIntervalMin > 0) duration = Plugin.Instance.Configuration.NagIntervalMin;

        logger.Info($"Nag Duration Set To {duration}");

        NagSessions ??= new List<NagSession>();

        if (!SessionIsInList(sessionId))
        {
            logger.Info($"Added sessionId {sessionId} to list.");
            var time = DateTime.UtcNow.AddMinutes(duration);

            if (addNow) time = DateTime.UtcNow;

            NagSessions.Add(new NagSession
                            {
                                SessionId    = sessionId,
                                NagAtTimeUtc = time
                            });
        }
    }

    public static void RemoveSessionFromList(string sessionId)
    {
        NagSessions ??= new List<NagSession>();

        NagSessions.RemoveAll(x => x.SessionId == sessionId);
    }

    public static List<NagSession> GetSessionsToNag()
    {
        NagSessions ??= new List<NagSession>();

        var output = NagSessions.Where(x => x.NagAtTimeUtc <= DateTime.UtcNow)
                                .ToList();

        return output;
    }

    public static bool SessionIsInList(string sessionId)
    {
        return NagSessions.Select(x => x.SessionId)
                          .Contains(sessionId);
    }
}