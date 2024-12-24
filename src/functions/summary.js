const data = {
    "CHR": [
        {"judge": "地狱", "grade": 0},
        {"min":4, "judge": "折磨", "grade": 0},
        {"min":6, "judge": "不佳", "grade": 0},
        {"min":12, "judge": "普通", "grade": 0},
        {"min":22, "judge": "优秀", "grade": 1},
        {"min":28, "judge": "罕见", "grade": 2},
        {"min":34, "judge": "逆天", "grade": 3},
    ],
    "MNY": [
        {"judge": "地狱", "grade": 0},
        {"min":4, "judge": "折磨", "grade": 0},
        {"min":6, "judge": "不佳", "grade": 0},
        {"min":12, "judge": "普通", "grade": 0},
        {"min":22, "judge": "优秀", "grade": 1},
        {"min":28, "judge": "罕见", "grade": 2},
        {"min":34, "judge": "逆天", "grade": 3},
    ],
    "SPR": [
        {"judge": "地狱", "grade": 0},
        {"min":4, "judge": "折磨", "grade": 0},
        {"min":6, "judge": "不幸", "grade": 0},
        {"min":12, "judge": "普通", "grade": 0},
        {"min":22, "judge": "幸福", "grade": 1},
        {"min":28, "judge": "极乐", "grade": 2},
        {"min":34, "judge": "天命", "grade": 3},
    ],
    "INT": [
        {"judge": "地狱", "grade": 0},
        {"min":4, "judge": "折磨", "grade": 0},
        {"min":6, "judge": "不佳", "grade": 0},
        {"min":12, "judge": "普通", "grade": 0},
        {"min":22, "judge": "优秀", "grade": 1},
        {"min":28, "judge": "罕见", "grade": 2},
        {"min":34, "judge": "逆天", "grade": 3},
        {"min":64, "judge": "识海", "grade": 3},
        {"min":394, "judge": "元神", "grade": 3},
        {"min":1504, "judge": "仙魂", "grade": 3},
    ],
    "STR": [
        {"judge": "地狱", "grade": 0},
        {"min":4, "judge": "折磨", "grade": 0},
        {"min":6, "judge": "不佳", "grade": 0},
        {"min":12, "judge": "普通", "grade": 0},
        {"min":22, "judge": "优秀", "grade": 1},
        {"min":28, "judge": "罕见", "grade": 2},
        {"min":34, "judge": "逆天", "grade": 3},
        {"min":64, "judge": "凝气", "grade": 3},
        {"min":304, "judge": "筑基", "grade": 3},
        {"min":1204, "judge": "金丹", "grade": 3},
        {"min":3004, "judge": "元婴", "grade": 3},
        {"min":6004, "judge": "仙体", "grade": 3},
    ],
    "AGE": [
        {"judge": "胎死腹中", "grade": 0},
        {"min":4, "judge": "早夭", "grade": 0},
        {"min":30, "judge": "少年", "grade": 0},
        {"min":54, "judge": "盛年", "grade": 0},
        {"min":120, "judge": "中年", "grade": 0},
        {"min":180, "judge": "花甲", "grade": 1},
        {"min":210, "judge": "古稀", "grade": 1},
        {"min":240, "judge": "杖朝", "grade": 2},
        {"min":270, "judge": "南山", "grade": 2},
        {"min":286, "judge": "不老", "grade": 3},
        {"min":300, "judge": "修仙", "grade": 3},
        {"min":1500, "judge": "仙寿", "grade": 3},
    ],
    "SUM": [
        {"judge": "地狱", "grade": 0},
        {"min":124, "judge": "折磨", "grade": 0},
        {"min":150, "judge": "不佳", "grade": 0},
        {"min":180, "judge": "普通", "grade": 0},
        {"min":240, "judge": "优秀", "grade": 1},
        {"min":300, "judge": "罕见", "grade": 2},
        {"min":330, "judge": "逆天", "grade": 3},
        {"min":360, "judge": "传说", "grade": 3},
    ]
}

function summary(type, value) {
    let length = data[type].length;
    while(length--) {
        const {min, judge, grade} = data[type][length];
        if(min==void 0 || value >= min) return {judge, grade};
    }
}

export { summary };