// energy-core.js — Shared module for Aire Energy Report
// Works in both Node.js (Jest tests) and browser (<script> tag)
(function(root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.EnergyCore = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {

    // PTAC Serial Numbers Data
    const ptacSerials = {
        '0801': ['485AE0'],
        '0803': ['6EE6C8'],
        '0804': ['6EF3C0', 'C57928'],
        '0806': ['48254C', '456C48'],
        '0808': ['6FFAB8', '3FC96C'],
        '0810': ['C64B30', '6F32B4', '3E4600'],
        '0813': ['C64A10'],
        '0814': ['6E9D98', '6E3AD0'],
        '0816': ['C653A0', '474D44'],
        '0818': ['702820'],
        '0819': ['C594A8'],
        '0822': ['6E09FC'],
        '0823': ['C58208'],
        '0824': ['48E6A0'],
        '0826': ['3E50CC', '4637B4'],
        '0828': ['6F122C', '4561A4', '6F12A0'],
        '0830': ['6F10D0'],
        '0831': ['6EF388'],
        '0832': ['C5C148'],
        '0833': ['C570BC'],
        '0835': ['C5A714'],
        '0836': ['C56840'],
        '0837': ['C5E9D0'],
        '0838': ['C64900'],
        '0839': ['491788'],
        '0840': ['C6C5D0'],
        '0841': ['C58F80', 'C68B7C', 'C5C790'],
        '0901': ['3E515C'],
        '0903': ['6E19B0'],
        '0904': ['4956AC', '48D59C', 'C6467C'],
        '0907': ['456ED4'],
        '0908': ['C65730', '700530'],
        '0910': ['6F0FE8', '462F70'],
        '0912': ['6F1BE4'],
        '0913': ['6F3494'],
        '0914': ['27E83C', 'E2C254'],
        '0916': ['6EFC44'],
        '0918': ['474B3C', 'C5B8D4', '48EE44'],
        '0920': ['6EA0C4'],
        '0922': ['6F133C'],
        '0923': ['6EF97C'],
        '0924': ['C5ADF8'],
        '0927': ['47843C', 'C5DCA4', '465684'],
        '0930': ['48D67C'],
        '0931': ['C55CDC'],
        '0932': ['454080'],
        '0933': ['6E1C20'],
        '0934': ['C63424'],
        '0935': ['48D36C'],
        '0938': ['455A40'],
        '0939': ['6F3354'],
        '0940': ['3E4F88'],
        '0942': ['35E344', '4931BC'],
        '1001': ['453148'],
        '1003': ['C5C930'],
        '1004': ['3E5300', '483018'],
        '1006': ['6F155C', '3E5118'],
        '1008': ['48CD8C', '6F3E94'],
        '1010': ['493110', '6F0CE0', '6EAF38'],
        '1013': ['3FC974'],
        '1014': ['C682F4', '4823DC'],
        '1016': ['C6A578', 'C62660'],
        '1018': ['C63C98'],
        '1019': ['3D411C'],
        '1020': ['C691DC'],
        '1021': ['6E6354'],
        '1022': ['70145C'],
        '1023': ['6F4AEC'],
        '1026': ['C5A438', '6EF868'],
        '1027': ['6F1464', 'C661F8', 'C5B0C0'],
        '1028': ['C661F8', 'C5B0C0', '6F1464'],
        '1029': ['C63554'],
        '1030': ['3E54B4'],
        '1031': ['3E51CC'],
        '1032': ['486B28'],
        '1033': ['3E533C'],
        '1034': ['C610D4'],
        '1035': ['C58388'],
        '1036': ['C621B4'],
        '1037': ['6E4F6C'],
        '1038': ['3E4560'],
        '1039': ['C62270'],
        '1040': ['C6863C'],
        '1042': ['3D615C', '3E51B8', '10F708'],
        '1101': ['10FD80'],
        '1103': ['6F1ADC'],
        '1104': ['6EE324', 'C0D00C', '703AA8'],
        '1107': ['119C48'],
        '1108': ['6F2364'],
        '1109': ['6F2618'],
        '1110': ['10F508'],
        '1112': ['3C6748', '10F720'],
        '1114': ['110200', '3D6250'],
        '1116': ['C577F8'],
        '1118': ['483F28', 'C13858', '486340'],
        '1120': ['6F2C70'],
        '1121': ['E2C14?'],
        '1123': ['6F1CD4'],
        '1124': ['6F1D0C'],
        '1126': ['3D6078', '10F610'],
        '1128': ['4857A8', 'C06078', '16C25C'],
        '1129': ['6F4A6C'],
        '1130': ['6F2B08'],
        '1131': ['10F7E0'],
        '1132': ['47AC3C'],
        '1133': ['1199AC'],
        '1134': ['C6871C'],
        '1135': ['6F1DD8'],
        '1136': ['119BFC'],
        '1137': ['6F2D2C'],
        '1138': ['3E5190', 'C66754'],
        '1140': ['C634B8'],
        '1141': ['C571F0'],
        '1142': ['C633B0'],
        '1143': ['110304'],
        '1201': ['110294'],
        '1203': ['10F874'],
        '1204': ['704854', 'C5918C'],
        '1206': ['6F75A4', '70411C'],
        '1208': ['6F7734', '6E323C'],
        '1210': ['6F2E18', '6F303C', '3744C4'],
        '1213': ['119BEC'],
        '1214': ['3E4594', 'C63FD8'],
        '1216': ['6F0EF0', '486030'],
        '1218': ['6EE278'],
        '1219': ['6F0F50'],
        '1220': ['C59E24'],
        '1221': ['10F498'],
        '1222': ['3D6164'],
        '1223': ['1102B0'],
        '1224': ['114140'],
        '1228': ['6F09CC', '6EFE94', '6F3384'],
        '1229': ['6F28A8'],
        '1230': ['6EF72C'],
        '1231': ['10F974'],
        '1232': ['493990'],
        '1233': ['113F68'],
        '1234': ['10FB30'],
        '1235': ['3D6058'],
        '1236': ['10FB88'],
        '1237': ['6F182C'],
        '1238': ['1102D8'],
        '1239': ['119AB8'],
        '1240': ['C74914'],
        '1241': ['6F2FB8', 'E2FFE4', '6F1408'],
        '1401': ['6F0F84'],
        '1403': ['C67DB0'],
        '1404': ['6F0474', '6F34A8', '484718'],
        '1407': ['C68334'],
        '1408': ['C5A73C', '6ED0C0'],
        '1410': ['6F3888', '3E455C'],
        '1412': ['C615A0', 'E2C27C'],
        '1414': ['C57CA4', 'C59C3C'],
        '1418': ['6F83E0', '6E9FF8', '6FFAC0'],
        '1419': ['C5DEA8'],
        '1420': ['492F04'],
        '1421': ['492718', '6E04E4'],
        '1423': ['464F6C'],
        '1424': ['3E5110'],
        '1426': ['48EBC0', '466E08'],
        '1428': ['492250', '484498', '48569C'],
        '1429': ['6F2C88'],
        '1430': ['C59748'],
        '1431': ['3E53E8'],
        '1432': ['6F0D34', 'E2C06C'],
        '1434': ['6E09C0'],
        '1435': ['C673A8'],
        '1436': ['6F33A0'],
        '1437': ['C592F8'],
        '1438': ['6ED5A4'],
        '1440': ['C66D00', '4663E0'],
        '1441': ['3E4580'],
        '1442': ['4827A0'],
        '1443': ['C740C8']
    };

    // Derived data structures
    const knownApartments = new Set(Object.keys(ptacSerials));

    const serialToApartment = {};
    Object.entries(ptacSerials).forEach(([aptNum, serials]) => {
        serials.forEach((serial, index) => {
            if (serial && serial !== '?') {
                serialToApartment[serial.toUpperCase()] = { aptNum, serialIndex: index + 1 };
            }
        });
    });

    /**
     * Parse a CSV column header and map it to an apartment + device.
     * Returns { aptNum, isAcHeater, deviceId } or all nulls if unrecognized.
     *
     * Column formats in the actual data:
     *   PTAC (AC & Heater) files:
     *     "0907-Mains_A (kWhs)"           -> apt 0907, single serial
     *     "0908-1-Mains_A (kWhs)"          -> apt 0908, serial index 1
     *     "0908-2-Mains_A (kWhs)"          -> apt 0908, serial index 2
     *     "808-1-Mains_A (kWhs)"           -> apt 0808 (3-digit, pad to 4)
     *     "1126 - 1-Mains_A (kWhs)"        -> apt 1126, serial index 1 (with spaces)
     *     "Floor 8 - 9: ... (Former name 0803)-Mains_A (kWhs)" -> apt 0803 (panel gateway)
     *   General Energy file:
     *     "...-Other-0820 (kWhs)"          -> apt 0820, general energy
     */
    function extractApartmentNumber(header) {
        // Skip non-data columns
        if (header.includes('Time Bucket')) {
            return { aptNum: null, isAcHeater: null, deviceId: null };
        }

        // Only process Mains_A and -Other- columns.
        // Mains_B, Mains_C, Circuit_1-16 are sub-channels, not separate devices.
        var isOtherCol = header.includes('-Other-');
        var isMainsA = header.includes('Mains_A');
        if (!isOtherCol && !isMainsA) {
            return { aptNum: null, isAcHeater: null, deviceId: null };
        }

        // --- General Energy: "-Other-XXXX" columns ---
        if (isOtherCol) {
            var otherMatch = header.match(/-Other-(\d{3,4})\b/);
            if (otherMatch) {
                var aptNum = otherMatch[1].padStart(4, '0');
                return { aptNum: aptNum, isAcHeater: false, deviceId: null };
            }
            return { aptNum: null, isAcHeater: null, deviceId: null };
        }

        // --- PTAC (AC & Heater): Mains_A columns ---

        // Pattern 1: "Former name XXXX" (panel gateway row)
        var formerNameMatch = header.match(/Former name[:\s]+(\d{3,4})/i);
        if (formerNameMatch) {
            var aptNum = formerNameMatch[1].padStart(4, '0');
            if (!knownApartments.has(aptNum)) {
                return { aptNum: null, isAcHeater: null, deviceId: null };
            }
            return { aptNum: aptNum, isAcHeater: true, deviceId: aptNum };
        }

        // Pattern 2: "APTNUM-Mains_A" or "APTNUM - INDEX-Mains_A" or "APTNUM-INDEX-Mains_A"
        // Handles: "0907-Mains_A", "0908-1-Mains_A", "808-1-Mains_A", "1126 - 1-Mains_A"
        var aptMatch = header.match(/^(\d{3,4})\s*(?:-\s*(\d{1,2}))?\s*-\s*Mains_A/);
        if (aptMatch) {
            var aptNum = aptMatch[1].padStart(4, '0');
            var deviceIndex = aptMatch[2] || null;

            // Validate this is a known apartment
            if (!knownApartments.has(aptNum)) {
                return { aptNum: null, isAcHeater: null, deviceId: null };
            }

            // Use the column index directly as the device ID
            // e.g., "0908-1-Mains_A" -> deviceId = "0908-1"
            //        "0907-Mains_A"   -> deviceId = "0907"
            var deviceId = deviceIndex ? aptNum + '-' + deviceIndex : aptNum;

            return { aptNum: aptNum, isAcHeater: true, deviceId: deviceId };
        }

        // No recognized pattern
        return { aptNum: null, isAcHeater: null, deviceId: null };
    }

    /**
     * Classify filenames against the 4 required document types.
     * Returns { requirements, allFound, foundCount }.
     */
    function classifyRequiredFiles(fileNames) {
        var requirements = {
            'general': { found: false, name: 'General Electric', matchedFile: null },
            'ac-8-9': { found: false, name: 'AC/Heater 8-9', matchedFile: null },
            'ac-10-11': { found: false, name: 'AC/Heater 10-11', matchedFile: null },
            'ac-12-14': { found: false, name: 'AC/Heater 12-14', matchedFile: null }
        };

        fileNames.forEach(function(fileName) {
            var lowerName = fileName.toLowerCase();

            // Check for General Electric (must have "general" or "other" and NOT have "ac" or "heater")
            var hasGeneral = lowerName.includes('general') || lowerName.includes('other');
            var hasAcOrHeater = lowerName.includes('ac') || lowerName.includes('heater');

            if (hasGeneral && !hasAcOrHeater) {
                requirements['general'].found = true;
                requirements['general'].matchedFile = fileName;
            }

            // Check for AC/Heater files (must contain ac/heater keywords)
            if (hasAcOrHeater) {
                // Check floors 8-9
                var is8_9 = lowerName.includes('floor_8_-_9') || lowerName.includes('floor 8 - 9') ||
                            lowerName.includes('8-9') || lowerName.includes('floor 8') || lowerName.includes('floor 9');
                if (is8_9) {
                    requirements['ac-8-9'].found = true;
                    requirements['ac-8-9'].matchedFile = fileName;
                }

                // Check floors 10-11
                var is10_11 = lowerName.includes('floor_10_-_11') || lowerName.includes('floor 10 - 11') ||
                              lowerName.includes('10-11') || lowerName.includes('floor 10') || lowerName.includes('floor 11');
                if (is10_11) {
                    requirements['ac-10-11'].found = true;
                    requirements['ac-10-11'].matchedFile = fileName;
                }

                // Check floors 12-14
                var is12_14 = lowerName.includes('floor_12_-_14') || lowerName.includes('floor 12 - 14') ||
                              lowerName.includes('12-14') || lowerName.includes('floor 12') ||
                              lowerName.includes('floor 13') || lowerName.includes('floor 14');
                if (is12_14) {
                    requirements['ac-12-14'].found = true;
                    requirements['ac-12-14'].matchedFile = fileName;
                }
            }
        });

        var allFound = true;
        var foundCount = 0;
        Object.values(requirements).forEach(function(req) {
            if (req.found) foundCount++;
            else allFound = false;
        });

        return { requirements: requirements, allFound: allFound, foundCount: foundCount };
    }

    /**
     * Extract hourly connectivity data from 15-minute detailed files.
     * Returns an object keyed by apartment number, each containing an array of interval data.
     */
    function extractHourlyConnectivityData(detailedData) {
        // Find the 15-minute file for PTAC devices
        var fifteenMinFile = detailedData.find(function(f) { return f.filename.includes('-15MIN'); });
        if (!fifteenMinFile) return null;

        var data = fifteenMinFile.data;
        var headers = fifteenMinFile.headers;
        var timeColumn = headers.find(function(h) { return h.includes('Time Bucket'); });

        // Find all PTAC columns (Mains_A only)
        var ptacColumns = {};
        headers.forEach(function(header) {
            if (!header.includes('Mains_A')) return;
            var result = extractApartmentNumber(header);
            if (result.aptNum && result.isAcHeater) {
                if (!ptacColumns[result.aptNum]) {
                    ptacColumns[result.aptNum] = header;
                }
            }
        });

        // Extract 15-minute data for each PTAC
        var intervalData = {};

        data.forEach(function(row) {
            if (!row[timeColumn]) return;

            var timestamp = new Date(row[timeColumn].trim().replace(/"/g, ''));
            if (isNaN(timestamp)) return;

            var timeKey = timestamp.getTime();

            Object.entries(ptacColumns).forEach(function(entry) {
                var aptNum = entry[0];
                var column = entry[1];

                if (!intervalData[aptNum]) {
                    intervalData[aptNum] = [];
                }

                var value = row[column] ? row[column].trim().replace(/"/g, '') : '';
                var isConnected = value && value !== 'No CT' && !isNaN(value) && parseFloat(value) >= 0;
                var isActive = isConnected && parseFloat(value) > 0;

                intervalData[aptNum].push({
                    timestamp: timeKey,
                    date: timestamp,
                    connected: isConnected ? 1 : 0,
                    active: isActive ? 1 : 0,
                    value: isConnected ? parseFloat(value) : null
                });
            });
        });

        return intervalData;
    }

    /**
     * Analyze outage data from detailed CSV files.
     * Returns { outagesByDate, outagesByApartment } or null if no data.
     */
    function processOutageData(detailedData) {
        if (detailedData.length === 0) return null;

        var outagesByDate = {};
        var outagesByApartment = {};

        detailedData.forEach(function(fileData) {
            var data = fileData.data;
            var headers = fileData.headers;

            var columnMap = {};
            headers.forEach(function(header) {
                var result = extractApartmentNumber(header);
                if (result.aptNum) {
                    columnMap[header] = { aptNum: result.aptNum, isAcHeater: result.isAcHeater, deviceId: result.deviceId };
                }
            });

            data.forEach(function(row) {
                var timeBucketCol = headers.find(function(h) { return h.includes('Time Bucket'); });
                var date = null;

                if (timeBucketCol && row[timeBucketCol]) {
                    try {
                        date = new Date(row[timeBucketCol].trim().replace(/"/g, ''));
                        var dateKey = date.toISOString().split('T')[0];
                        if (!outagesByDate[dateKey]) outagesByDate[dateKey] = 0;
                    } catch (e) {}
                }

                Object.entries(columnMap).forEach(function(entry) {
                    var column = entry[0];
                    var info = entry[1];
                    var value = row[column] ? row[column].trim().replace(/"/g, '') : '';
                    if (value === 'No CT' || value === '' || value === '0' || isNaN(value)) {
                        if (date) {
                            var dateKey = date.toISOString().split('T')[0];
                            outagesByDate[dateKey]++;

                            if (!outagesByApartment[info.aptNum]) {
                                outagesByApartment[info.aptNum] = 0;
                            }
                            outagesByApartment[info.aptNum]++;
                        }
                    }
                });
            });
        });

        return { outagesByDate: outagesByDate, outagesByApartment: outagesByApartment };
    }

    /**
     * Main aggregation engine. Processes daily data for totals and detailed data for uptime metrics.
     */
    function aggregateEnergyData(dailyData, detailedData, costPerKwh) {
        var apartmentData = {};
        var deviceTracking = {};
        var deviceUptime = {};
        var earliestDate = null;
        var latestDate = null;

        // First pass: Process daily data for totals
        var processedDailyDevices = new Set();

        dailyData.forEach(function(fileData) {
            var data = fileData.data;
            var headers = fileData.headers;
            var filename = fileData.filename;

            var columnMap = {};
            headers.forEach(function(header) {
                var result = extractApartmentNumber(header);
                if (result.aptNum) {
                    // Map xx27 apartments to xx28
                    var targetAptNum = result.aptNum;
                    if (result.aptNum.endsWith('27')) {
                        targetAptNum = result.aptNum.slice(0, -2) + '28';
                    }

                    var key = targetAptNum + '_' + (result.isAcHeater ? 'AC' : 'GEN') + '_' + (result.deviceId || 'main');

                    // DEDUP: Skip if already processed from another file
                    if (processedDailyDevices.has(key)) {
                        return;
                    }
                    processedDailyDevices.add(key);

                    columnMap[header] = { aptNum: targetAptNum, isAcHeater: result.isAcHeater, deviceId: result.deviceId };

                    if (!apartmentData[targetAptNum]) {
                        apartmentData[targetAptNum] = {
                            acHeater: 0,
                            general: 0,
                            devices: {}
                        };
                    }

                    if (!deviceTracking[key]) {
                        deviceTracking[key] = {
                            aptNum: targetAptNum,
                            isAcHeater: result.isAcHeater,
                            deviceId: result.deviceId || 'main',
                            hasData: false,
                            totalKwh: 0
                        };
                    }
                }
            });

            data.forEach(function(row) {
                var timeBucketCol = headers.find(function(h) { return h.includes('Time Bucket'); });
                if (timeBucketCol && row[timeBucketCol]) {
                    var dateStr = row[timeBucketCol].trim().replace(/"/g, '');
                    try {
                        var date = new Date(dateStr);
                        if (!earliestDate || date < earliestDate) earliestDate = date;
                        if (!latestDate || date > latestDate) latestDate = date;
                    } catch (e) {}
                }

                Object.entries(columnMap).forEach(function(entry) {
                    var column = entry[0];
                    var info = entry[1];
                    var value = row[column] ? row[column].trim().replace(/"/g, '') : '';
                    if (value && value !== 'No CT' && !isNaN(value)) {
                        var numValue = parseFloat(value);
                        var key = info.aptNum + '_' + (info.isAcHeater ? 'AC' : 'GEN') + '_' + (info.deviceId || 'main');

                        if (info.isAcHeater) {
                            apartmentData[info.aptNum].acHeater += numValue;
                        } else {
                            apartmentData[info.aptNum].general += numValue;
                        }

                        if (deviceTracking[key]) {
                            deviceTracking[key].hasData = true;
                            deviceTracking[key].totalKwh += numValue;
                        }

                        var deviceKey = (info.isAcHeater ? 'AC' : 'GEN') + '_' + (info.deviceId || 'main');
                        if (!apartmentData[info.aptNum].devices[deviceKey]) {
                            apartmentData[info.aptNum].devices[deviceKey] = 0;
                        }
                        apartmentData[info.aptNum].devices[deviceKey] += numValue;
                    }
                });
            });
        });

        // Second pass: Calculate uptime from 15-MINUTE detailed data only
        var fifteenMinFiles = detailedData.filter(function(f) { return f.filename && f.filename.includes('-15MIN'); });
        var processedDeviceKeys = new Set();

        // Known panel-to-floor mappings
        var panelFloorMap = [
            { panelId: '10F874', minFloor: 12, maxFloor: 14 },
            { panelId: 'C5C930', minFloor: 10, maxFloor: 11 },
            { panelId: '6EE6C8', minFloor: 8, maxFloor: 9 },
        ];

        // Sort files so known-panel files are processed first
        var sortedFifteenMinFiles = fifteenMinFiles.slice().sort(function(a, b) {
            var aKnown = panelFloorMap.some(function(p) { return a.filename.includes(p.panelId); });
            var bKnown = panelFloorMap.some(function(p) { return b.filename.includes(p.panelId); });
            return (bKnown ? 1 : 0) - (aKnown ? 1 : 0);
        });

        sortedFifteenMinFiles.forEach(function(fileData) {
            var data = fileData.data;
            var headers = fileData.headers;
            var filename = fileData.filename;

            var matchedPanel = panelFloorMap.find(function(p) { return filename.includes(p.panelId); });

            var columnMap = {};
            headers.forEach(function(header) {
                var result = extractApartmentNumber(header);
                if (result.aptNum) {
                    var targetAptNum = result.aptNum;
                    if (result.aptNum.endsWith('27')) {
                        targetAptNum = result.aptNum.slice(0, -2) + '28';
                    }

                    var key = targetAptNum + '_' + (result.isAcHeater ? 'AC' : 'GEN') + '_' + (result.deviceId || 'main');

                    // DEDUP CHECK
                    if (processedDeviceKeys.has(key)) {
                        return;
                    }

                    // Floor-based filtering
                    if (matchedPanel) {
                        var floorNum = parseInt(targetAptNum.substring(0, 2));
                        if (floorNum < matchedPanel.minFloor || floorNum > matchedPanel.maxFloor) {
                            return;
                        }
                    }

                    processedDeviceKeys.add(key);
                    columnMap[header] = { aptNum: targetAptNum, isAcHeater: result.isAcHeater, deviceId: result.deviceId };

                    if (!deviceUptime[key]) {
                        deviceUptime[key] = {
                            totalIntervals: 0,
                            connectedIntervals: 0,
                            activeIntervals: 0,
                            aptNum: targetAptNum,
                            isAcHeater: result.isAcHeater,
                            deviceId: result.deviceId || 'main'
                        };
                    }
                }
            });

            data.forEach(function(row) {
                Object.entries(columnMap).forEach(function(entry) {
                    var column = entry[0];
                    var info = entry[1];
                    var key = info.aptNum + '_' + (info.isAcHeater ? 'AC' : 'GEN') + '_' + (info.deviceId || 'main');
                    var value = row[column] ? row[column].trim().replace(/"/g, '') : '';

                    if (deviceUptime[key]) {
                        deviceUptime[key].totalIntervals++;

                        var trimmedValue = value ? value.trim() : '';

                        if (trimmedValue && trimmedValue !== 'No CT') {
                            var numValue = parseFloat(trimmedValue);
                            if (!isNaN(numValue) && numValue >= 0) {
                                deviceUptime[key].connectedIntervals++;

                                if (numValue > 0) {
                                    deviceUptime[key].activeIntervals++;
                                }
                            }
                        }
                    }
                });
            });
        });

        var outageData = processOutageData(detailedData);

        var apartments = [];
        var grandTotal = { cost: 0, kwh: 0, acCost: 0, acKwh: 0, genCost: 0, genKwh: 0 };

        // Collect and merge apartment data (xx27 -> xx28 remapping)
        var aptDataMap = {};
        Object.keys(apartmentData).sort().forEach(function(aptNum) {
            var data = apartmentData[aptNum];

            var targetAptNum = aptNum;
            if (aptNum.endsWith('27')) {
                targetAptNum = aptNum.slice(0, -2) + '28';
            }

            if (!aptDataMap[targetAptNum]) {
                aptDataMap[targetAptNum] = {
                    acHeater: 0,
                    general: 0,
                    devices: {},
                    sourceApartments: []
                };
            }

            aptDataMap[targetAptNum].acHeater += data.acHeater;
            aptDataMap[targetAptNum].general += data.general;
            aptDataMap[targetAptNum].sourceApartments.push(aptNum);

            Object.entries(data.devices).forEach(function(entry) {
                var deviceKey = entry[0];
                var kwh = entry[1];
                if (!aptDataMap[targetAptNum].devices[deviceKey]) {
                    aptDataMap[targetAptNum].devices[deviceKey] = 0;
                }
                aptDataMap[targetAptNum].devices[deviceKey] += kwh;
            });
        });

        // Process combined apartment data
        Object.keys(aptDataMap).sort().forEach(function(aptNum) {
            var data = aptDataMap[aptNum];
            var totalKwh = data.acHeater + data.general;
            var totalCost = totalKwh * costPerKwh;
            var acCost = data.acHeater * costPerKwh;
            var genCost = data.general * costPerKwh;

            var acDevices = Object.keys(data.devices).filter(function(k) { return k.startsWith('AC_'); });
            var genDevices = Object.keys(data.devices).filter(function(k) { return k.startsWith('GEN_'); });
            var hasMultipleDevices = acDevices.length > 1 || genDevices.length > 1;
            var hasNoAcData = data.acHeater === 0 && acDevices.length === 0;
            var hasNoGenData = data.general === 0 && genDevices.length === 0;

            var deviceDetails = [];

            var hasPTACData = data.acHeater > 0;
            var hasInUnitData = data.general > 0;

            Object.entries(data.devices).forEach(function(entry) {
                var deviceKey = entry[0];
                var kwh = entry[1];
                var parts = deviceKey.split('_');
                var type = parts[0];
                var id = parts.slice(1).join('_');
                var isAc = type === 'AC';
                var uptimeKey = aptNum + '_' + type + '_' + id;

                var connectivity = null;
                var runtime = null;
                if (deviceUptime[uptimeKey]) {
                    var ut = deviceUptime[uptimeKey];
                    if (ut.totalIntervals > 0) {
                        connectivity = (ut.connectedIntervals / ut.totalIntervals * 100).toFixed(1);
                        runtime = (ut.activeIntervals / ut.totalIntervals * 100).toFixed(1);
                    }
                }

                deviceDetails.push({
                    type: isAc ? 'PTAC' : 'In-Unit',
                    deviceId: id,
                    kwh: kwh,
                    cost: kwh * costPerKwh,
                    connectivity: connectivity,
                    runtime: runtime,
                    hasData: kwh > 0
                });
            });

            // Ensure at least one PTAC entry
            var hasPTACEntry = deviceDetails.some(function(d) { return d.type === 'PTAC'; });
            if (hasPTACData && !hasPTACEntry) {
                deviceDetails.push({
                    type: 'PTAC', deviceId: 'main', kwh: data.acHeater, cost: acCost,
                    connectivity: null, runtime: null, hasData: true
                });
            }

            // Ensure at least one In-Unit entry
            var hasInUnitEntry = deviceDetails.some(function(d) { return d.type === 'In-Unit'; });
            if (hasInUnitData && !hasInUnitEntry) {
                deviceDetails.push({
                    type: 'In-Unit', deviceId: 'main', kwh: data.general, cost: genCost,
                    connectivity: null, runtime: null, hasData: true
                });
            }

            // Add entries for missing devices
            if (!hasPTACData && !hasPTACEntry) {
                deviceDetails.push({
                    type: 'PTAC', deviceId: 'main', kwh: 0, cost: 0,
                    connectivity: null, runtime: null, hasData: false
                });
            }
            if (!hasInUnitData && !hasInUnitEntry) {
                deviceDetails.push({
                    type: 'In-Unit', deviceId: 'main', kwh: 0, cost: 0,
                    connectivity: null, runtime: null, hasData: false
                });
            }

            apartments.push({
                aptNum: aptNum,
                totalCost: totalCost,
                totalKwh: totalKwh,
                acCost: acCost,
                acKwh: data.acHeater,
                genCost: genCost,
                genKwh: data.general,
                devices: data.devices,
                deviceDetails: deviceDetails,
                hasMultipleDevices: hasMultipleDevices,
                hasNoAcData: hasNoAcData,
                hasNoGenData: hasNoGenData
            });

            grandTotal.cost += totalCost;
            grandTotal.kwh += totalKwh;
            grandTotal.acCost += acCost;
            grandTotal.acKwh += data.acHeater;
            grandTotal.genCost += genCost;
            grandTotal.genKwh += data.general;
        });

        // Extract hourly PTAC connectivity data for charts
        var detailedDataForCharts = extractHourlyConnectivityData(detailedData);

        return {
            apartments: apartments,
            grandTotal: grandTotal,
            deviceTracking: deviceTracking,
            deviceUptime: deviceUptime,
            outageData: outageData,
            dateRange: { earliest: earliestDate, latest: latestDate },
            costPerKwh: costPerKwh,
            detailedDataForCharts: detailedDataForCharts
        };
    }

    // Public API
    return {
        ptacSerials: ptacSerials,
        knownApartments: knownApartments,
        serialToApartment: serialToApartment,
        extractApartmentNumber: extractApartmentNumber,
        classifyRequiredFiles: classifyRequiredFiles,
        aggregateEnergyData: aggregateEnergyData,
        extractHourlyConnectivityData: extractHourlyConnectivityData,
        processOutageData: processOutageData
    };
}));
