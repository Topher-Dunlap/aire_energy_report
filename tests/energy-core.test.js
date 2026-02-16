const {
    ptacSerials,
    knownApartments,
    serialToApartment,
    extractApartmentNumber,
    classifyRequiredFiles,
    aggregateEnergyData,
    extractHourlyConnectivityData,
    processOutageData
} = require('../src/energy-core');

// ============================================================
// ptacSerials data integrity
// ============================================================
describe('ptacSerials data', () => {
    test('all apartment numbers are 4-digit strings', () => {
        Object.keys(ptacSerials).forEach(apt => {
            expect(apt).toMatch(/^\d{4}$/);
        });
    });

    test('all serial arrays are non-empty', () => {
        Object.entries(ptacSerials).forEach(([apt, serials]) => {
            expect(serials.length).toBeGreaterThan(0);
        });
    });

    test('knownApartments matches ptacSerials keys', () => {
        expect(knownApartments.size).toBe(Object.keys(ptacSerials).length);
    });

    test('serialToApartment has entries for known serials', () => {
        expect(Object.keys(serialToApartment).length).toBeGreaterThan(0);
        // Spot check
        expect(serialToApartment['456ED4']).toEqual({ aptNum: '0907', serialIndex: 1 });
    });
});

// ============================================================
// extractApartmentNumber
// ============================================================
describe('extractApartmentNumber', () => {
    const nullResult = { aptNum: null, isAcHeater: null, deviceId: null };

    // --- Skip non-data columns ---
    test('returns nulls for Time Bucket column', () => {
        expect(extractApartmentNumber('Time Bucket (America/Denver)')).toEqual(nullResult);
    });

    test('returns nulls for Mains_B column', () => {
        expect(extractApartmentNumber('0907-Mains_B (kWhs)')).toEqual(nullResult);
    });

    test('returns nulls for Circuit column', () => {
        expect(extractApartmentNumber('0907-Circuit_1 (kWhs)')).toEqual(nullResult);
    });

    // --- Direct PTAC: "APTNUM-Mains_A" ---
    test('parses direct PTAC format: 0907-Mains_A', () => {
        expect(extractApartmentNumber('0907-Mains_A (kWhs)')).toEqual({
            aptNum: '0907', isAcHeater: true, deviceId: '0907'
        });
    });

    // --- Indexed PTAC: "APTNUM-INDEX-Mains_A" ---
    test('parses indexed PTAC format: 0908-1-Mains_A', () => {
        expect(extractApartmentNumber('0908-1-Mains_A (kWhs)')).toEqual({
            aptNum: '0908', isAcHeater: true, deviceId: '0908-1'
        });
    });

    test('parses second index: 0908-2-Mains_A', () => {
        expect(extractApartmentNumber('0908-2-Mains_A (kWhs)')).toEqual({
            aptNum: '0908', isAcHeater: true, deviceId: '0908-2'
        });
    });

    // --- 3-digit apartment (pad to 4) ---
    test('pads 3-digit apartment to 4 digits: 808 -> 0808', () => {
        expect(extractApartmentNumber('808-1-Mains_A (kWhs)')).toEqual({
            aptNum: '0808', isAcHeater: true, deviceId: '0808-1'
        });
    });

    // --- Spaces in header ---
    test('handles spaces: 1126 - 1-Mains_A', () => {
        expect(extractApartmentNumber('1126 - 1-Mains_A (kWhs)')).toEqual({
            aptNum: '1126', isAcHeater: true, deviceId: '1126-1'
        });
    });

    // --- Panel gateway: "Former name XXXX" ---
    test('parses panel gateway format with Former name', () => {
        expect(extractApartmentNumber('Floor 8 - 9: Apt AC & Heaters (Former name 0803)-Mains_A (kWhs)')).toEqual({
            aptNum: '0803', isAcHeater: true, deviceId: '0803'
        });
    });

    // --- General energy: "-Other-XXXX" ---
    test('parses general energy format: -Other-0820', () => {
        expect(extractApartmentNumber('Floor 8 - 9 (Apartments General Energy Usage) (...)-Other-0820 (kWhs)')).toEqual({
            aptNum: '0820', isAcHeater: false, deviceId: null
        });
    });

    test('pads 3-digit general energy apartment: -Other-820', () => {
        expect(extractApartmentNumber('Something-Other-820 (kWhs)')).toEqual({
            aptNum: '0820', isAcHeater: false, deviceId: null
        });
    });

    // --- Unknown apartment numbers ---
    test('returns nulls for unknown apartment in Mains_A', () => {
        expect(extractApartmentNumber('9999-Mains_A (kWhs)')).toEqual(nullResult);
    });

    test('returns nulls for unknown apartment in Former name', () => {
        expect(extractApartmentNumber('Floor 8 - 9: (Former name 9999)-Mains_A (kWhs)')).toEqual(nullResult);
    });
});

// ============================================================
// classifyRequiredFiles
// ============================================================
describe('classifyRequiredFiles', () => {
    test('returns all found when all 4 required file types present', () => {
        const files = [
            'Apartments General Energy Usage-1DAY.csv',
            'Floor 8 - 9 AC Heaters-1DAY.csv',
            'Floor 10 - 11 AC Heaters-1DAY.csv',
            'Floor 12 - 14 AC Heaters-1DAY.csv'
        ];
        const result = classifyRequiredFiles(files);
        expect(result.allFound).toBe(true);
        expect(result.foundCount).toBe(4);
    });

    test('returns not found when general file is missing', () => {
        const files = [
            'Floor 8 - 9 AC Heaters-1DAY.csv',
            'Floor 10 - 11 AC Heaters-1DAY.csv',
            'Floor 12 - 14 AC Heaters-1DAY.csv'
        ];
        const result = classifyRequiredFiles(files);
        expect(result.allFound).toBe(false);
        expect(result.foundCount).toBe(3);
        expect(result.requirements['general'].found).toBe(false);
    });

    test('handles underscore filename format', () => {
        const files = [
            'Apartments_General_Energy_Usage-1DAY.csv',
            'Floor_8_-_9_AC_Heaters-1DAY.csv',
            'Floor_10_-_11_AC_Heaters-1DAY.csv',
            'Floor_12_-_14_AC_Heaters-1DAY.csv'
        ];
        const result = classifyRequiredFiles(files);
        expect(result.allFound).toBe(true);
    });

    test('returns empty when no files match', () => {
        const result = classifyRequiredFiles(['random_file.csv']);
        expect(result.allFound).toBe(false);
        expect(result.foundCount).toBe(0);
    });

    test('does not classify a file with both general and ac keywords as general', () => {
        const files = ['General AC Heater-1DAY.csv'];
        const result = classifyRequiredFiles(files);
        expect(result.requirements['general'].found).toBe(false);
    });

    test('handles case insensitivity', () => {
        const files = [
            'APARTMENTS GENERAL ENERGY USAGE-1DAY.csv',
            'FLOOR 8 - 9 AC HEATERS-1DAY.csv',
            'FLOOR 10 - 11 AC HEATERS-1DAY.csv',
            'FLOOR 12 - 14 AC HEATERS-1DAY.csv'
        ];
        const result = classifyRequiredFiles(files);
        expect(result.allFound).toBe(true);
    });

    test('handles empty file list', () => {
        const result = classifyRequiredFiles([]);
        expect(result.allFound).toBe(false);
        expect(result.foundCount).toBe(0);
    });
});

// ============================================================
// aggregateEnergyData
// ============================================================
describe('aggregateEnergyData', () => {
    test('calculates correct cost for single apartment', () => {
        const dailyData = [{
            filename: 'test-1DAY.csv',
            headers: ['Time Bucket (America/Denver)', '0907-Mains_A (kWhs)'],
            data: [
                { 'Time Bucket (America/Denver)': '2026-01-15', '0907-Mains_A (kWhs)': '10.5' },
                { 'Time Bucket (America/Denver)': '2026-01-16', '0907-Mains_A (kWhs)': '12.3' }
            ]
        }];
        const result = aggregateEnergyData(dailyData, [], 0.132);
        const apt0907 = result.apartments.find(a => a.aptNum === '0907');
        expect(apt0907).toBeDefined();
        expect(apt0907.acKwh).toBeCloseTo(22.8, 1);
        expect(apt0907.totalCost).toBeCloseTo(22.8 * 0.132, 2);
    });

    test('separates AC and general usage', () => {
        const dailyData = [
            {
                filename: 'ac-1DAY.csv',
                headers: ['Time Bucket (America/Denver)', '0907-Mains_A (kWhs)'],
                data: [{ 'Time Bucket (America/Denver)': '2026-01-15', '0907-Mains_A (kWhs)': '10.0' }]
            },
            {
                filename: 'general-1DAY.csv',
                headers: ['Time Bucket (America/Denver)', 'Something-Other-0907 (kWhs)'],
                data: [{ 'Time Bucket (America/Denver)': '2026-01-15', 'Something-Other-0907 (kWhs)': '5.0' }]
            }
        ];
        const result = aggregateEnergyData(dailyData, [], 0.132);
        const apt = result.apartments.find(a => a.aptNum === '0907');
        expect(apt.acKwh).toBeCloseTo(10.0);
        expect(apt.genKwh).toBeCloseTo(5.0);
        expect(apt.totalKwh).toBeCloseTo(15.0);
    });

    test('maps xx27 apartments to xx28', () => {
        const dailyData = [{
            filename: 'test-1DAY.csv',
            headers: ['Time Bucket (America/Denver)', '0927-Mains_A (kWhs)'],
            data: [{ 'Time Bucket (America/Denver)': '2026-01-15', '0927-Mains_A (kWhs)': '5.0' }]
        }];
        const result = aggregateEnergyData(dailyData, [], 0.132);
        const apt0928 = result.apartments.find(a => a.aptNum === '0928');
        const apt0927 = result.apartments.find(a => a.aptNum === '0927');
        expect(apt0928).toBeDefined();
        expect(apt0927).toBeUndefined();
    });

    test('skips "No CT" values', () => {
        const dailyData = [{
            filename: 'test-1DAY.csv',
            headers: ['Time Bucket (America/Denver)', '0907-Mains_A (kWhs)'],
            data: [
                { 'Time Bucket (America/Denver)': '2026-01-15', '0907-Mains_A (kWhs)': 'No CT' },
                { 'Time Bucket (America/Denver)': '2026-01-16', '0907-Mains_A (kWhs)': '5.0' }
            ]
        }];
        const result = aggregateEnergyData(dailyData, [], 0.132);
        const apt = result.apartments.find(a => a.aptNum === '0907');
        expect(apt.acKwh).toBeCloseTo(5.0);
    });

    test('deduplicates same device across multiple files', () => {
        const dailyData = [
            {
                filename: 'file1-1DAY.csv',
                headers: ['Time Bucket (America/Denver)', '0907-Mains_A (kWhs)'],
                data: [{ 'Time Bucket (America/Denver)': '2026-01-15', '0907-Mains_A (kWhs)': '10.0' }]
            },
            {
                filename: 'file2-1DAY.csv',
                headers: ['Time Bucket (America/Denver)', '0907-Mains_A (kWhs)'],
                data: [{ 'Time Bucket (America/Denver)': '2026-01-15', '0907-Mains_A (kWhs)': '10.0' }]
            }
        ];
        const result = aggregateEnergyData(dailyData, [], 0.132);
        const apt = result.apartments.find(a => a.aptNum === '0907');
        expect(apt.acKwh).toBeCloseTo(10.0);
    });

    test('grand total sums all apartments', () => {
        const dailyData = [{
            filename: 'test-1DAY.csv',
            headers: ['Time Bucket (America/Denver)', '0907-Mains_A (kWhs)', '0908-Mains_A (kWhs)'],
            data: [{
                'Time Bucket (America/Denver)': '2026-01-15',
                '0907-Mains_A (kWhs)': '10.0',
                '0908-Mains_A (kWhs)': '20.0'
            }]
        }];
        const result = aggregateEnergyData(dailyData, [], 0.132);
        expect(result.grandTotal.acKwh).toBeCloseTo(30.0);
        expect(result.grandTotal.cost).toBeCloseTo(30.0 * 0.132, 2);
    });

    test('tracks date range', () => {
        const dailyData = [{
            filename: 'test-1DAY.csv',
            headers: ['Time Bucket (America/Denver)', '0907-Mains_A (kWhs)'],
            data: [
                { 'Time Bucket (America/Denver)': '2026-01-10', '0907-Mains_A (kWhs)': '5.0' },
                { 'Time Bucket (America/Denver)': '2026-01-20', '0907-Mains_A (kWhs)': '5.0' }
            ]
        }];
        const result = aggregateEnergyData(dailyData, [], 0.132);
        expect(result.dateRange.earliest).toEqual(new Date('2026-01-10'));
        expect(result.dateRange.latest).toEqual(new Date('2026-01-20'));
    });

    test('returns empty apartments for no recognizable data', () => {
        const dailyData = [{
            filename: 'test-1DAY.csv',
            headers: ['Time Bucket (America/Denver)', 'Unknown-Column (kWhs)'],
            data: [{ 'Time Bucket (America/Denver)': '2026-01-15', 'Unknown-Column (kWhs)': '10.0' }]
        }];
        const result = aggregateEnergyData(dailyData, [], 0.132);
        expect(result.apartments).toHaveLength(0);
        expect(result.grandTotal.cost).toBe(0);
    });
});

// ============================================================
// extractHourlyConnectivityData
// ============================================================
describe('extractHourlyConnectivityData', () => {
    test('returns null when no 15MIN file present', () => {
        const data = [{ filename: 'test-1DAY.csv', headers: [], data: [] }];
        expect(extractHourlyConnectivityData(data)).toBeNull();
    });

    test('marks connected and active intervals correctly', () => {
        const data = [{
            filename: 'test-15MIN.csv',
            headers: ['Time Bucket (America/Denver)', '0907-Mains_A (kWhs)'],
            data: [
                { 'Time Bucket (America/Denver)': '2026-01-15T00:00:00', '0907-Mains_A (kWhs)': '0.5' },
                { 'Time Bucket (America/Denver)': '2026-01-15T00:15:00', '0907-Mains_A (kWhs)': 'No CT' },
                { 'Time Bucket (America/Denver)': '2026-01-15T00:30:00', '0907-Mains_A (kWhs)': '0' }
            ]
        }];
        const result = extractHourlyConnectivityData(data);
        expect(result['0907']).toHaveLength(3);
        // Connected and active
        expect(result['0907'][0].connected).toBe(1);
        expect(result['0907'][0].active).toBe(1);
        // No CT - not connected
        expect(result['0907'][1].connected).toBe(0);
        expect(result['0907'][1].active).toBe(0);
        // Zero value - connected but not active
        expect(result['0907'][2].connected).toBe(1);
        expect(result['0907'][2].active).toBe(0);
    });
});

// ============================================================
// processOutageData
// ============================================================
describe('processOutageData', () => {
    test('returns null for empty input', () => {
        expect(processOutageData([])).toBeNull();
    });

    test('detects "No CT" as outage', () => {
        const data = [{
            headers: ['Time Bucket (America/Denver)', '0907-Mains_A (kWhs)'],
            data: [{
                'Time Bucket (America/Denver)': '2026-01-15T00:00:00',
                '0907-Mains_A (kWhs)': 'No CT'
            }]
        }];
        const result = processOutageData(data);
        expect(result.outagesByApartment['0907']).toBe(1);
        expect(result.outagesByDate['2026-01-15']).toBe(1);
    });

    test('detects empty string as outage', () => {
        const data = [{
            headers: ['Time Bucket (America/Denver)', '0907-Mains_A (kWhs)'],
            data: [{
                'Time Bucket (America/Denver)': '2026-01-15T00:00:00',
                '0907-Mains_A (kWhs)': ''
            }]
        }];
        const result = processOutageData(data);
        expect(result.outagesByApartment['0907']).toBe(1);
    });

    test('detects "0" as outage', () => {
        const data = [{
            headers: ['Time Bucket (America/Denver)', '0907-Mains_A (kWhs)'],
            data: [{
                'Time Bucket (America/Denver)': '2026-01-15T00:00:00',
                '0907-Mains_A (kWhs)': '0'
            }]
        }];
        const result = processOutageData(data);
        expect(result.outagesByApartment['0907']).toBe(1);
    });

    test('counts outages across multiple apartments', () => {
        const data = [{
            headers: ['Time Bucket (America/Denver)', '0907-Mains_A (kWhs)', '0908-Mains_A (kWhs)'],
            data: [{
                'Time Bucket (America/Denver)': '2026-01-15T00:00:00',
                '0907-Mains_A (kWhs)': 'No CT',
                '0908-Mains_A (kWhs)': ''
            }]
        }];
        const result = processOutageData(data);
        expect(result.outagesByDate['2026-01-15']).toBe(2);
        expect(result.outagesByApartment['0907']).toBe(1);
        expect(result.outagesByApartment['0908']).toBe(1);
    });

    test('does not count valid data as outage', () => {
        const data = [{
            headers: ['Time Bucket (America/Denver)', '0907-Mains_A (kWhs)'],
            data: [{
                'Time Bucket (America/Denver)': '2026-01-15T00:00:00',
                '0907-Mains_A (kWhs)': '5.5'
            }]
        }];
        const result = processOutageData(data);
        expect(result.outagesByApartment['0907']).toBeUndefined();
    });
});
