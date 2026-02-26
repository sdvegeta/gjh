// 模拟广交会底层展厅与展位字典的高保真数据
// 依据 3-10产品方案 与 展馆精简版_运营视图 

export const mockZoneDict = [
    {
        value: 'A_ZONE',
        label: 'A区',
        children: [
            {
                value: '1F',
                label: '1F',
                children: [
                    { value: 'hall_8_0', label: '8.0展厅' },
                    { value: 'hall_8_1', label: '8.1展厅' },
                    { value: 'hall_5_0', label: '5.0展厅' },
                    { value: 'hall_7_1', label: '7.1展厅' },
                    { value: 'hall_6_1', label: '6.1展厅' },
                    { value: 'hall_6_0', label: '6.0展厅' },
                    { value: 'hall_5_1', label: '5.1展厅' },
                    { value: 'hall_4_1', label: '4.1展厅' },
                    { value: 'hall_4_0', label: '4.0展厅' },
                    { value: 'hall_3_1', label: '3.1展厅' },
                    { value: 'hall_2_1', label: '2.1展厅' },
                    { value: 'hall_1_1', label: '1.1展厅' }
                ]
            },
            {
                value: 'LF',
                label: 'LF',
                children: [
                    { value: 'hall_8', label: '8展厅' },
                    { value: 'hall_7', label: '7展厅' },
                    { value: 'hall_6', label: '6展厅' },
                    { value: 'hall_5', label: '5展厅' },
                    { value: 'hall_4', label: '4展厅' },
                    { value: 'hall_3', label: '3展厅' },
                    { value: 'hall_2', label: '2展厅' },
                    { value: 'hall_1', label: '1展厅' }
                ]
            },
            {
                value: '2F',
                label: '2F',
                children: [
                    { value: 'hall_5_2', label: '5.2展厅' },
                    { value: 'hall_4_2', label: '4.2展厅' },
                    { value: 'hall_3_2', label: '3.2展厅' },
                    { value: 'hall_2_2', label: '2.2展厅' },
                    { value: 'hall_1_2', label: '1.2展厅' }
                ]
            }
        ]
    },
    {
        value: 'B_ZONE',
        label: 'B区',
        children: [
            {
                value: '1F',
                label: '1F',
                children: [
                    { value: 'hall_13_1', label: '13.1展厅' },
                    { value: 'hall_12_1', label: '12.1展厅' },
                    { value: 'hall_11_1', label: '11.1展厅' },
                    { value: 'hall_10_1', label: '10.1展厅' },
                    { value: 'hall_9_1', label: '9.1展厅' }
                ]
            },
            {
                value: 'M1',
                label: 'M1',
                children: [
                    { value: 'hall_13_0', label: '13.0展厅' },
                    { value: 'hall_12_0', label: '12.0展厅' },
                    { value: 'hall_9_0', label: '9.0展厅' }
                ]
            },
            {
                value: '2F',
                label: '2F',
                children: [
                    { value: 'hall_13_2', label: '13.2展厅' },
                    { value: 'hall_12_2', label: '12.2展厅' },
                    { value: 'hall_11_2', label: '11.2展厅' },
                    { value: 'hall_10_2', label: '10.2展厅' },
                    { value: 'hall_9_2', label: '9.2展厅' }
                ]
            },
            {
                value: '3F',
                label: '3F',
                children: [
                    { value: 'hall_11_3', label: '11.3展厅' },
                    { value: 'hall_10_3', label: '10.3展厅' },
                    { value: 'hall_9_3', label: '9.3展厅' }
                ]
            }
        ]
    },
    {
        value: 'C_ZONE',
        label: 'C区',
        children: [
            {
                value: '1F',
                label: '1F',
                children: [
                    { value: 'hall_15_1', label: '15.1展厅' },
                    { value: 'hall_14_1', label: '14.1展厅' }
                ]
            },
            {
                value: '2F',
                label: '2F',
                children: [
                    { value: 'hall_16_2', label: '16.2展厅' },
                    { value: 'hall_15_2', label: '15.2展厅' },
                    { value: 'hall_14_2', label: '14.2展厅' }
                ]
            },
            {
                value: '3F',
                label: '3F',
                children: [
                    { value: 'hall_16_3', label: '16.3展厅' },
                    { value: 'hall_15_3', label: '15.3展厅' },
                    { value: 'hall_14_3', label: '14.3展厅' }
                ]
            },
            {
                value: '4F',
                label: '4F',
                children: [
                    { value: 'hall_16_4', label: '16.4展厅' },
                    { value: 'hall_15_4', label: '15.4展厅' },
                    { value: 'hall_14_4', label: '14.4展厅' }
                ]
            }
        ]
    },
    {
        value: 'D_ZONE',
        label: 'D区',
        children: [
            {
                value: '1F',
                label: '1F',
                children: [
                    { value: 'hall_20_1', label: '20.1展厅' },
                    { value: 'hall_19_1', label: '19.1展厅' },
                    { value: 'hall_18_1', label: '18.1展厅' },
                    { value: 'hall_17_1', label: '17.1展厅' }
                ]
            },
            {
                value: 'LF',
                label: 'LF',
                children: [
                    { value: 'hall_21_2', label: '21.2展厅' },
                    { value: 'hall_20', label: '20展厅' },
                    { value: 'hall_19', label: '19展厅' },
                    { value: 'hall_18', label: '18展厅' },
                    { value: 'hall_17', label: '17展厅' },
                    { value: 'hall_friendship', label: '友谊大厅' }
                ]
            },
            {
                value: '2F',
                label: '2F',
                children: [
                    { value: 'hall_20_2', label: '20.2展厅' },
                    { value: 'hall_19_2', label: '19.2展厅' },
                    { value: 'hall_18_2', label: '18.2展厅' },
                    { value: 'hall_17_2', label: '17.2展厅' }
                ]
            }
        ]
    }
]

const generateMockBooths = (hallValue) => {
    const booths = [];
    const prefixes = ['A', 'B', 'C', 'D', 'E'];
    for (let i = 0; i < 50; i++) {
        const prefix = prefixes[i % prefixes.length];
        const number = String(Math.floor(i / prefixes.length) + 1).padStart(2, '0');
        booths.push({
            boothCode: `${prefix}${number}`,
            deliverPointId: `point_${hallValue}_${(i % 5) + 1}`
        });
    }
    // 添加一些特殊的展位用于搜索模拟
    booths.push({ boothCode: 'X100', deliverPointId: `point_${hallValue}_1` });
    booths.push({ boothCode: 'Y200', deliverPointId: `point_${hallValue}_2` });
    booths.push({ boothCode: 'A01-1', deliverPointId: `point_${hallValue}_3` });
    return booths;
};

// 预先生成所有展厅字典
export const mockBoothDictMap = {};
mockZoneDict.forEach(zone => {
    zone.children.forEach(floor => {
        floor.children.forEach(hall => {
            mockBoothDictMap[hall.value] = generateMockBooths(hall.value);
        });
    });
});

// 模拟 H5 初始换取的用户基础信息 (SSO 遗留态)
export const mockUserInfo = {
    phone: '13812345678',
    defaultName: ''
}
