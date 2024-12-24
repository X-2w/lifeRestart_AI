import Property from './property.js';
import Event from './event.js';
import Talent from './talent.js';
import Achievement from './achievement.js';

class Life {
    constructor() {
        this.#property = new Property();
        this.#event = new Event();
        this.#talent = new Talent();
        this.#achievement = new Achievement();
    }

    #property;
    #event;
    #talent;
    #achievement;
    #triggerTalents;

    async initial() {
        const [age, talents, events, achievements] = await Promise.all([
          json('age'),
          json('talents'),
          json('events'),
          json('achievement'),
        ])
        this.#property.initial({age});
        this.#talent.initial({talents});
        this.#event.initial({events});
        this.#achievement.initial({achievements});
    }

    checkSelections(id,description) {
        const event = this.#event.get(id);
        console.log('获取到事件id,检查是否存在描述');
        if (!event.selections) {
            console.log('不存在，调用API');
            clearTimeout(this.apiCallTimeout);
            this.apiCallTimeout = setTimeout(() => {
                this.wenXinAPI(id, description);
            }, 5000); // 十秒后调用
        }else if (event.selections) {
            console.log("存在，调用本地数据")
            this.#property.upDataSelection(event.selections);
            this.#property.upDataAI(event.selections.normal);
            this.select(0);
        }else{
            console.log("check error")
        }
    }

    // 调用记录
    tokens = this.getStoredTokens();

    getStoredTokens() {
        const storedTokens = localStorage.getItem('tokens');
        const lastReset = localStorage.getItem('lastReset');
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        if (lastReset !== today) {
            localStorage.setItem('lastReset', today);
            localStorage.setItem('tokens', 0);
            return 0;
        }

        return storedTokens ? parseInt(storedTokens, 10) : 0;
    }

    set tokens(value) {
        localStorage.setItem('tokens', value);
    }
    
    // ai获取选项
    async wenXinAPI(eventId,inputText) {
        console.log('发送文本',inputText);
        const appId = '9d8aLRdnMwaUBSYmHoUtvj9ScT0fXpbI';
        const secretKey = 'APdrEVtV6CQBjg9awvpTMSQUM9sN9j6K';
        const openId = '9d8aLRdnMwaUBSYmHoUtvj9ScT0fXpbI'; // Unique user ID
        const token ="24.01a37e70a772b7a0635313419ed5d429.2592000.1737377110.282335-116602943";
        const requestBody = {
            message: {
                content: {
                    type: "text",
                    value: {
                        showText: inputText
                    }
                },
                source: appId,
                from: "openapi",
                openId: openId
            }
        };

            try {
                const response = await fetch('https://agentapi.baidu.com/assistant/getAnswer?appId=' + appId + '&secretKey='+ secretKey, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });
    
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
    
                const parsedData = await response.json();

                console.log('接收到数据转换为json',parsedData);
                
                const nestedJsonString = parsedData.data.content[0].data;
                
                // 移除 Markdown 标记并提取 JSON 字符串
                let cleanedJsonString = nestedJsonString.replace(/^\`\`\`json([\s\S]*?)\`\`\`$/, '$1');
                // 移除数据中的+
                cleanedJsonString = cleanedJsonString.replace(/\+(\d+)/g, '$1'); // 将 +10 替换为 10
                // // 解析嵌套的JSON字符串
                const nestedJsonObject = JSON.parse(cleanedJsonString);

                console.log('解析嵌套json',nestedJsonObject);
                // 上传选项
                this.tokens++;   
                
                // 获取到的api数据添加到事件与添加到proper
                this.#property.upDataSelection(nestedJsonObject);
                this.#property.upDataAI(nestedJsonObject.normal);
                this.#event.addSelections(eventId,nestedJsonObject);

                console.log("AI发送数据",nestedJsonObject)
                
                
                this.select(0);


            } catch (error) {
                console.error(error)
            }
    }

    select(option){
        const selections = this.getLastRecord().SEL;
        let formattedData;
        let id;
        if (option === 0) {
            id = "option0"
            formattedData = {
                CHR: selections.normal.CHR,
                INT: selections.normal.INT,
                STR: selections.normal.STR,
                MNY: selections.normal.MNY,
                SPR: selections.normal.SPR,
            };
        } else if (option === 1) {
            id = "option1"
            formattedData = {
                CHR: selections.option1.CHR,
                INT: selections.option1.INT,
                STR: selections.option1.STR,
                MNY: selections.option1.MNY,
                SPR: selections.option1.SPR,
            };
        } else if (option === 2) {
            id = "option2"
            formattedData = {
                CHR: selections.option2.CHR,
                INT: selections.option2.INT,
                STR: selections.option2.STR,
                MNY: selections.option2.MNY,
                SPR: selections.option2.SPR,
            };
        } else if (option === 3) {
            id = "option3";
            formattedData = {
                CHR: selections.option3.CHR,
                INT: selections.option3.INT,
                STR: selections.option3.STR,
                MNY: selections.option3.MNY,
                SPR: selections.option3.SPR,
            };
        };  
        // 添加到页面
        if (option >= 1 && option <= 3) {
            const li = $(`<li><span>·</span><span>${selections[id].description}</span></li>`);
            li.appendTo('#lifeTrajectory');
            this.freshText(this.getLastRecord(),option);
            // 更新属性
            this.#property.upDataSelection(formattedData);
            this.#property.upDataAI(formattedData.id);
        }
        this.freshTotal();
         

 
    }
    
    // 更新页面
    freshTotal() {
                            setTimeout(() => {
        const property = this.getLastRecord();
        console.log('更新页面输入',property)
        const tokens = this.getStoredTokens();
        $("#lifeProperty").html(`
            <li ><span>调用</span><span>${tokens}</span></li>
            <li style="width:10%;flex:auto;"><span>数据来源</span><span>文心一言</span></li>
            <li><span>颜值</span><span>${property.LSCHR}${property.CHCHR >= 0 ? '+' : ''} ${property.CHCHR}</span></li>
            <li><span>智力</span><span>${property.LSINT}${property.CHINT >= 0 ? '+' : ''} ${property.CHINT}</span></li>
            <li><span>体质</span><span>${property.LSSTR}${property.CHSTR >= 0 ? '+' : ''} ${property.CHSTR}</span></li>
            <li><span>家境</span><span>${property.LSMNY}${property.CHMNY >= 0 ? '+' : ''} ${property.CHMNY}</span></li>
            <li><span>快乐</span><span>${property.LSSPR}${property.CHSPR >= 0 ? '+' : ''} ${property.CHSPR}</span></li>
        `);
        $("#selection").html(`
                <li id="option1" style="user-select:auto;">${property.SEL.selection1.description}</li>
                <li id="option2" style="user-select:auto;">${property.SEL.selection2.description}</li>
                <li id="option3" style="user-select:auto;">${property.SEL.selection3.description}</li>
                <li>
                <input type="text" id="option4" aria-label="Input Text" style="width:100%;padding: 0; font-size: 1rem; border: 0.1rem #EEEEEE solid; background-color: #393E46; color: #EEEEEE; text-align: center;margin:3px;">
                <input type="submit" aria-label="Submit" class="mainbtn" style=" padding: 5px; font-size: 1rem; border: 0.1rem #EEEEEE solid; background-color: #393E46; color: #EEEEEE; text-align: center;margin:3px;">
                </li>
        `);
        console.log('AI更新页面点数变化',
            property.CHCHR,
            property.CHINT,
            property.CHSTR,
            property.CHMNY,
            property.CHSPR)
        }, 2000);}



    freshText(property, option) {
        let selection;
        let id;
        if (option === 1) {
            selection = property.SEL.selection1;
            id = "option1";
        } else if (option === 2) {
            selection = property.SEL.selection2;
            id = "option2";
        } else if (option === 3) {
            selection = property.SEL.selection3;
            id = "option3";
        }
        $(`#${id}`).html(`颜值：${selection.CHR} 智力：${selection.INT} 体质：${selection.STR} 家庭：${selection.MNY} 快乐：${selection.SPR}`);
    }

    restart(allocation) {
        this.#triggerTalents = {};
        this.#property.restart(allocation);
        this.doTalent();
        this.#property.restartLastStep();
        this.#achievement.achieve(
            this.#achievement.Opportunity.START,
            this.#property
        )
    }

    getTalentAllocationAddition(talents) {
        return this.#talent.allocationAddition(talents);
    }

    getTalentCurrentTriggerCount(talentId) {
        return this.#triggerTalents[talentId] || 0;
    }

    next() {
        const {age, event, talent} = this.#property.ageNext();

        const talentContent = this.doTalent(talent);
        const eventContent = this.doEvent(this.random(event));

        const isEnd = this.#property.isEnd();

        const content = [talentContent, eventContent].flat();
        this.#achievement.achieve(
            this.#achievement.Opportunity.TRAJECTORY,
            this.#property
        )
        return { age, content, isEnd };
    }

    doTalent(talents) {
        if(talents) this.#property.change(this.#property.TYPES.TLT, talents);
        talents = this.#property.get(this.#property.TYPES.TLT)
            .filter(talentId => this.getTalentCurrentTriggerCount(talentId) < this.#talent.get(talentId).max_triggers);

        const contents = [];
        for(const talentId of talents) {
            const result = this.#talent.do(talentId, this.#property);
            if(!result) continue;
            this.#triggerTalents[talentId] = this.getTalentCurrentTriggerCount(talentId) + 1;
            const { effect, name, description, grade } = result;
            contents.push({
                type: this.#property.TYPES.TLT,
                name,
                grade,
                description,
            })
            if(!effect) continue;
            this.#property.effect(effect);
        }
        return contents;
    }

    doEvent(eventId) {
        const { effect, next, description, postEvent } = this.#event.do(eventId, this.#property);
        this.#property.change(this.#property.TYPES.EVT, eventId);

        // AI获取数据
        this.checkSelections(eventId,description);

        this.#property.effect(effect);
        const content = {
            type: this.#property.TYPES.EVT,
            description,
            postEvent,
        }
        if(next) return [content, this.doEvent(next)].flat();
        return [content];
    }

    random(events) {
        events = events.filter(([eventId])=>this.#event.check(eventId, this.#property));

        let totalWeights = 0;
        for(const [, weight] of events)
            totalWeights += weight;

        let random = Math.random() * totalWeights;
        for(const [eventId, weight] of events)
            if((random-=weight)<0)
                return eventId;
        return events[events.length-1];
    }

    talentRandom() {
        const times = this.#property.get(this.#property.TYPES.TMS);
        const achievement = this.#property.get(this.#property.TYPES.CACHV);
        return this.#talent.talentRandom(this.getLastExtendTalent(), { times, achievement });
    }

    talentExtend(talentId) {
        this.#property.set(this.#property.TYPES.EXT, talentId);
    }

    getLastExtendTalent() {
        return this.#property.get(this.#property.TYPES.EXT);
    }

    getSummary() {
        this.#achievement.achieve(
            this.#achievement.Opportunity.SUMMARY,
            this.#property
        )
        return {
            AGE: this.#property.get(this.#property.TYPES.HAGE),
            CHR: this.#property.get(this.#property.TYPES.HCHR),
            INT: this.#property.get(this.#property.TYPES.HINT),
            STR: this.#property.get(this.#property.TYPES.HSTR),
            MNY: this.#property.get(this.#property.TYPES.HMNY),
            SPR: this.#property.get(this.#property.TYPES.HSPR),
            SUM: this.#property.get(this.#property.TYPES.SUM),
        };
    }

    getLastRecord() {
        return this.#property.getLastRecord();
    }

    exclusive(talents, exclusive) {
        return this.#talent.exclusive(talents, exclusive);
    }

    getAchievements() {
        const ticks = {};
        this.#property
            .get(this.#property.TYPES.ACHV)
            .forEach(([id, tick]) => ticks[id] = tick);
        return this
            .#achievement
            .list(this.#property)
            .sort((
                {id: a, grade: ag, hide: ah},
                {id: b, grade: bg, hide: bh}
            )=>{
                a = ticks[a];
                b = ticks[b];
                if(a&&b) return b - a;
                if(!a&&!b) {
                    if(ah&&bh) return bg - ag;
                    if(ah) return 1;
                    if(bh) return -1;
                    return bg - ag;
                }
                if(!a) return 1;
                if(!b) return -1;
            });
    }

    getTotal() {
        const TMS = this.#property.get(this.#property.TYPES.TMS);
        const CACHV = this.#property.get(this.#property.TYPES.CACHV);
        const CTLT = this.#property.get(this.#property.TYPES.CTLT);
        const CEVT = this.#property.get(this.#property.TYPES.CEVT);

        const totalTalent = this.#talent.count();
        const totalEvent = this.#event.count();

        return {
            times: TMS,
            achievement: CACHV,
            talentRate: CTLT / totalTalent,
            eventRate: CEVT / totalEvent,
        }
    }

    get times() { return this.#property?.get(this.#property.TYPES.TMS) || 0; }
    set times(v) {
        this.#property?.set(this.#property.TYPES.TMS, v) || 0;
        this.#achievement.achieve(
            this.#achievement.Opportunity.END,
            this.#property
        )
    }
    writeEventss(){
        this.#event.writeEvents()
    }
}

export default Life;

