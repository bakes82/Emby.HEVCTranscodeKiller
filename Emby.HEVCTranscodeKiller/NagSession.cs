using System;

namespace Emby.HEVCTranscodeKiller;

public class NagSession
{
    public string   SessionId    { get; set; }
    public DateTime NagAtTimeUtc { get; set; }
}