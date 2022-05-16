using System;
using System.Collections.Generic;
using System.IO;
using Emby.HEVCTranscodeKiller.Configuration;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Drawing;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;

namespace Emby.HEVCTranscodeKiller;

public class Plugin : BasePlugin<PluginConfiguration>, IHasWebPages, IHasThumbImage
{
    private readonly Guid _id = new("B433A70D-0DDB-47C6-B08A-45F8614AAAB2");

    public Plugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer) : base(applicationPaths,
     xmlSerializer)
    {
        Instance = this;
    }

    public override string Name => "Emby HEVC Transcode Killer";

    public override string Description => "Ability to stop HEVC video and/or audio transcoding";

    public static Plugin Instance { get; private set; }

    public override Guid Id => _id;

    public Stream GetThumbImage()
    {
        var type = GetType();
        return type.Assembly.GetManifestResourceStream(type.Namespace + ".logo.png");
    }

    public ImageFormat ThumbImageFormat => ImageFormat.Png;

    public IEnumerable<PluginPageInfo> GetPages()
    {
        return new[]
               {
                   new PluginPageInfo
                   {
                       Name = "EmbyHEVCTranscodeKillerConfigurationPage",
                       EmbeddedResourcePath = GetType()
                           .Namespace + ".Configuration.EmbyHEVCTranscodeKiller.html"
                   },
                   new PluginPageInfo
                   {
                       Name = "EmbyHEVCTranscodeKillerConfigurationPageJS",
                       EmbeddedResourcePath = GetType()
                           .Namespace + ".Configuration.EmbyHEVCTranscodeKiller.js"
                   }
               };
    }
}