define(["loading", "dialogHelper", "formDialogStyle", "emby-checkbox", "emby-select", "emby-toggle"],
    function (loading, dialogHelper) {

        var pluginId = "B433A70D-0DDB-47C6-B08A-45F8614AAAB2";

        return function (view) {
            view.addEventListener('viewshow',
                async () => {
                    var chkAudioKill = view.querySelector('#enableAudioKilling');
                    var chkVideoKill = view.querySelector('#enableVideoKilling');
                    var msgBoth = view.querySelector('#customBothMessage');
                    var msgVideo = view.querySelector('#customVideoMessage');
                    var msgAudio = view.querySelector('#customAudioMessage');

                    ApiClient.getPluginConfiguration(pluginId).then((config) => {
                        chkAudioKill.checked = config.EnableKillingOfAudio ?? false;
                        chkVideoKill.checked = config.EnableKillingOfVideo ?? false;

                        if (config.MessageForBoth === null || config.MessageForBoth === undefined) {
                            msgBoth.value = "Transcoding of video & audio is prohibited.";
                        } else {
                            msgBoth.value = config.MessageForBoth;
                        }
                        
                        if (config.MessageForAudioOnly === null || config.MessageForAudioOnly === undefined) {
                            msgAudio.value = "Transcoding of audio is prohibited.";
                        } else {
                            msgAudio.value = config.MessageForAudioOnly;
                        }

                        if (config.MessageForVideoOnly === null || config.MessageForVideoOnly === undefined) {
                            msgVideo.value = "Transcoding of video is prohibited.";
                        } else {
                            msgVideo.value = config.MessageForVideoOnly;
                        }
                    });

                    chkAudioKill.addEventListener('change', (elem) => {
                        elem.preventDefault();
                        var value = chkAudioKill.checked;
                        EnableAudioKilling(value);
                    });

                    chkVideoKill.addEventListener('change', (elem) => {
                        elem.preventDefault();
                        var value = chkVideoKill.checked;
                        EnableVideoKilling(value);
                    });

                    msgBoth.addEventListener('change', (elem) => {
                        elem.preventDefault();
                        var value = msgBoth.value;
                        SetBothMessage(value);
                    });

                    msgVideo.addEventListener('change', (elem) => {
                        elem.preventDefault();
                        var value = msgVideo.value;
                        SetVideoMessage(value);
                    });

                    msgAudio.addEventListener('change', (elem) => {
                        elem.preventDefault();
                        var value = msgAudio.value;
                        SetAudioMessage(value);
                    });

                    function EnableAudioKilling(value) {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.EnableKillingOfAudio = value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => {
                            });
                        });
                    }

                    function EnableVideoKilling(value) {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.EnableKillingOfVideo = value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => {
                            });
                        });
                    }

                    function SetBothMessage(value) {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.MessageForBoth = value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => {
                            });
                        });
                    }

                    function SetVideoMessage(value) {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.MessageForVideoOnly = value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => {
                            });
                        });
                    }

                    function SetAudioMessage(value) {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.MessageForAudioOnly = value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => {
                            });
                        });
                    }
                });
        }
    });