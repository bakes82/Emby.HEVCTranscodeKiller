using MediaBrowser.Model.Plugins;

namespace Emby.HEVCTranscodeKiller.Configuration
{
    public class PluginConfiguration : BasePluginConfiguration
    {
        public bool     EnableKillingOfAudio { get; set; }
        public bool     EnableKillingOfVideo { get; set; }
        public string   MessageForBoth       { get; set; }
        public string   MessageForAudioOnly  { get; set; }
        public string   MessageForVideoOnly  { get; set; }
        public string[] ExcludedLibraries    { get; set; }
    }
}