using System;

namespace Emby.HEVCTranscodeKiller
{
    public class PausedSession
    {
        public string   SessionId       { get; set; }
        public DateTime PausedAtTimeUtc { get; set; }
        public DateTime KillAtTimeUtc   { get; set; }
    }
}