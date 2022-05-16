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

                    var msgBothNags = view.querySelector('#customBothMessageNags');
                    var msgVideoNags = view.querySelector('#customVideoMessageNags');
                    var msgAudioNags = view.querySelector('#customAudioMessageNags');

                    var nagTime = view.querySelector('#nagMin');

                    var chkAudioNag = view.querySelector('#enableAudioNag');
                    var chkVideoNag = view.querySelector('#enableVideoNag');

                    var ckhEnablePause = view.querySelector('#enablePausedVideoKilling');
                    var msgPause = view.querySelector('#customPausedMessage');
                    var pauseTime = view.querySelector('#pausedDurationMin');

                    var excludedFolders = [];
                    var distinctLibraries = [];

                    ApiClient.getPluginConfiguration(pluginId).then((config) => {
                        chkAudioKill.checked = config.EnableKillingOfAudio ?? false;
                        chkVideoKill.checked = config.EnableKillingOfVideo ?? false;
                        ckhEnablePause.checked = config.EnableKillingOfPausedVideo ?? false;
                        chkAudioNag.checked = config.EnableAudioTranscodeNags ?? false;
                        chkVideoNag.checked = config.EnableVideoTranscodeNags ?? false;

                        pauseTime.value = config.PausedDuration === null || config.PausedDuration === 0 ? 5 : config.PausedDuration;
                        nagTime.value = config.NagIntervalMin === null || config.NagIntervalMin === 0 ? 5 : config.NagIntervalMin;

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

                        if (config.MessageForPausedVideo === null || config.MessageForPausedVideo === undefined) {
                            msgPause.value = "Video paused too long.";
                        } else {
                            msgPause.value = config.MessageForPausedVideo;
                        }

                        if (config.MessageForBothNags === null || config.MessageForBothNags === undefined) {
                            msgBothNags.value = "You are transcoding video & audio.";
                        } else {
                            msgBothNags.value = config.MessageForBothNags;
                        }

                        if (config.MessageForVideoOnlyNags === null || config.MessageForVideoOnlyNags === undefined) {
                            msgVideoNags.value = "You are transcoding video.";
                        } else {
                            msgVideoNags.value = config.MessageForVideoOnlyNags;
                        }

                        if (config.MessageForAudioOnlyNags === null || config.MessageForAudioOnlyNags === undefined) {
                            msgAudioNags.value = "You are transcoding audio.";
                        } else {
                            msgAudioNags.value = config.MessageForAudioOnlyNags;
                        }
                    });

                    loadFolders();

                    ckhEnablePause.addEventListener('change', (elem) => {
                        elem.preventDefault();
                        var value = ckhEnablePause.checked;
                        EnablePauseKilling(value);
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

                    msgPause.addEventListener('change', (elem) => {
                        elem.preventDefault();
                        var value = msgPause.value;
                        SetPausedMessage(value);
                    });

                    pauseTime.addEventListener('change', (elem) => {
                        elem.preventDefault();
                        var value = pauseTime.value;
                        SetPausedTime(value);
                    });

                    chkAudioNag.addEventListener('change', (elem) => {
                        elem.preventDefault();
                        var value = chkAudioNag.checked;
                        EnableAudioNag(value);
                    });

                    chkVideoNag.addEventListener('change', (elem) => {
                        elem.preventDefault();
                        var value = chkVideoNag.checked;
                        EnableVideoNag(value);
                    });

                    nagTime.addEventListener('change', (elem) => {
                        elem.preventDefault();
                        var value = nagTime.value;
                        SetNagTime(value);
                    });

                    msgBothNags.addEventListener('change', (elem) => {
                        elem.preventDefault();
                        var value = msgBothNags.value;
                        SetBothNagsMessage(value);
                    });

                    msgVideoNags.addEventListener('change', (elem) => {
                        elem.preventDefault();
                        var value = msgVideoNags.value;
                        SetVideoNagsMessage(value);
                    });

                    msgAudioNags.addEventListener('change', (elem) => {
                        elem.preventDefault();
                        var value = msgAudioNags.value;
                        SetAudioNagsMessage(value);
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

                    function EnablePauseKilling(value) {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.EnableKillingOfPausedVideo = value;
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

                    function SetPausedMessage(value) {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.MessageForPausedVideo = value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => {
                            });
                        });
                    }

                    function SetPausedTime(value) {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.PausedDuration = value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => {
                            });
                        });
                    }

                    function EnableAudioNag(value) {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.EnableAudioTranscodeNags = value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => {
                            });
                        });
                    }

                    function EnableVideoNag(value) {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.EnableVideoTranscodeNags = value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => {
                            });
                        });
                    }

                    function SetNagTime(value) {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.NagIntervalMin = value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => {
                            });
                        });
                    }

                    function SetBothNagsMessage(value) {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.MessageForBothNags = value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => {
                            });
                        });
                    }

                    function SetVideoNagsMessage(value) {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.MessageForVideoOnlyNags = value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => {
                            });
                        });
                    }

                    function SetAudioNagsMessage(value) {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.MessageForAudioOnlyNags = value;
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