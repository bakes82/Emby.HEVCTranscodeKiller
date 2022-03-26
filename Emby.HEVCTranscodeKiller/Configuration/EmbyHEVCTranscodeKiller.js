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

                    var excludedFolders = [];
                    var distinctLibraries = [];

                    ApiClient.getPluginConfiguration(pluginId).then((config) => {
                        chkAudioKill.checked = config.EnableKillingOfAudio ?? false;
                        chkVideoKill.checked = config.EnableKillingOfVideo ?? false;

                        if (config.ExcludedLibraries !== undefined && config.ExcludedLibraries !== null && config.ExcludedLibraries !== []) {
                            excludedFolders = config.ExcludedLibraries;
                        }

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

                    loadFolders();

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

                    function loadFolders() {
                        ApiClient.getVirtualFolders().then((folders) => {
                            var html = "";
                            html += '<div data-role="controlgroup">';

                            folders.Items.forEach(function (item, index) {
                                console.log(item);
                                html += getFolderHtml(item, index);
                            });

                            html += '</div>';
                            console.log(html);
                            document.getElementById("divExcludeLocations").innerHTML = html;

                            var excluededCheckboxes = document.getElementsByClassName("chkExcludeLibrary");
                            for (var i = 0; i < excluededCheckboxes.length; i++) {
                                excluededCheckboxes[i].addEventListener('click', excludeLibrary, false);
                            }
                        });

                    }

                    function getFolderHtml(virtualFolder, index) {
                        console.log(virtualFolder);
                        var html = "";
                        for (var i = 0, length = virtualFolder.Locations.length; i < length; i++) {
                            var id = "chkFolder" + index + "_" + i;
                            var location = virtualFolder.Locations[i];
                            if (distinctLibraries.includes(location)) {
                                continue;
                            } else {
                                distinctLibraries.push(location);
                            }
                            var isChecked = excludedFolders.includes(location);
                            var checkedAttribute = isChecked ? 'checked="checked"' : "";
                            html += '<label><input is="emby-checkbox" class="chkExcludeLibrary" type="checkbox" data-mini="true" id="' + id + '" name="' + id + '" data-location="' + location + '" ' + checkedAttribute + ' /><span>' + location + '</span></label>';
                        }
                        return html;
                    }

                    function excludeLibrary() {
                        var value = this.getAttribute("data-location");
                        console.log(value);
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            if (config.ExcludedLibraries !== null && config.ExcludedLibraries !== undefined && config.ExcludedLibraries.includes(value)) {
                                config.ExcludedLibraries = removeItemOnce(config.ExcludedLibraries, value);
                            } else {
                                if (config.ExcludedLibraries === null || config.ExcludedLibraries === undefined) {
                                    config.ExcludedLibraries = [];
                                }
                                config.ExcludedLibraries.push(value);
                            }
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => {
                            });
                        });
                    }
                });

            function removeItemOnce(arr, value) {
                var index = arr.indexOf(value);
                if (index > -1) {
                    arr.splice(index, 1);
                }
                return arr;
            }
        }
    });