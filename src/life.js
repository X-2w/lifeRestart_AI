import Property from './property.js';
import Event from './event.js';
import Talent from './talent.js';
import Achievement from './achievement.js';

class Life {

    static fullAI = false;

    constructor() {
        this.#property = new Property();
        this.#event = new Event();
        this.#talent = new Talent();
        this.#achievement = new Achievement();
        this.#isFetching = false; // 添加此行
        this.#currentEvent = {};
        this.#process = [];
        this.#API = 1;
        this.#openId = Math.floor(Math.random() * 100000);
    }

    get isFetching() {
        return this.#isFetching;
    }
    set isFetching(value) {
        this.#isFetching = value;
    }

    #property;
    #event;
    #talent;
    #achievement;
    #isFetching;
    #triggerTalents;
    #currentEvent;
    #process;
    apiCallTimeout;
    #previousDescriptionsLength
    #API;
    #openId;

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

    checkSelections(description) {
        console.log('获取到事件id,检查是否存在描述');
        console.log('全ai',Life.fullAI)
        if (!this.#currentEvent.selections || Life.fullAI) {
            console.log('不存在选项，调用API');
            clearTimeout(this.apiCallTimeout);
            this.apiCallTimeout = setTimeout(async () => {
                this.#currentEvent.selections = await this.wenXinAPI(description);
                console.log('更新当前事件为',this.#currentEvent);
                this.#event.addSelections(this.#currentEvent);
            }, 2000); 
        }else if (this.#currentEvent.selections && !Life.fullAI) {
            console.log("存在选项，调用本地数据")
            this.#property.upDataSelection(this.#currentEvent.selections);
            this.#property.upDataAI(this.#currentEvent.selections.normal);
            this.select(0);
        }else{
            console.log("check error")
        }
    }

    async checkSelections1(description, path) {
        console.log('获取到事件id,检查是否存在描述');
    
        const propertyAccessArray = path.split('.');
        let currentObject = this.#currentEvent;
        for (let i = 0; i < propertyAccessArray.length; i++) {
            if (currentObject[propertyAccessArray[i]] === undefined) {
                currentObject = undefined;
                break;
            }
            currentObject = currentObject[propertyAccessArray[i]];
        }
        if (!currentObject || Life.fullAI) {
            console.log('不存在选项，调用API', path);
            clearTimeout(this.apiCallTimeout);
            this.apiCallTimeout = setTimeout(async () => {
                const result = await this.wenXinAPI(description);
                this.setNestedProperty(this.#currentEvent, path, result);
                console.log('更新当前事件为', this.#currentEvent);
            }, 2000);
        } else {
            console.log("存在选项，调用本地数据");
            this.#property.upDataSelection(currentObject);
            this.#property.upDataAI(currentObject.normal);
            this.select(0);
        }
    }
    
    setNestedProperty(obj, propertyPath, value) {
        const parts = propertyPath.split('.');
        const last = parts.pop();
        const target = parts.reduce((acc, part) => acc && acc[part], obj);
        if (target) {
            target[last] = value;
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
    async wenXinAPI(inputText) {
        this.isFetching = true; // 在 API 调用前设置标志为 true
        const age = this.getLastRecord().AGE;
        console.log('发送文本', age + `岁的时候，` + inputText);
        let appId = 'HNKx1HzUJ2pBXOwxcXd4sdHApY7NozO0'
        let secretKey = '6QDRP3CUbLRjdPRJEwCgWIAz1aAUwGiV'
        if (this.#API === 2){
            appId = '9d8aLRdnMwaUBSYmHoUtvj9ScT0fXpbI';
            secretKey = 'fMAO8u9Z8eBZ2jozMchN0gslVWcLAr7s';
        }
        const openId = 'conversation'+this.#openId; // Unique user ID
        const token = "24.01a37e70a772b7a0635313419ed5d429.2592000.1737377110.282335-116602943";
        const requestBody = {
            message: {
                content: {
                    type: "text",
                    value: {
                        showText: age + `岁的时候，` + inputText
                    }
                },
                source: appId,
                from: "openapi",
                openId: openId
            }
        };
    
        try {
            const response = await fetch('https://agentapi.baidu.com/assistant/conversation?appId=' + appId + '&secretKey=' + secretKey, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
    
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let jsonBuffer = '';
            let collectingJson = false;//目前api传输过来没有了```json所以暂时改成true
    
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log("Stream complete");
                    break;
                }
    
                buffer += decoder.decode(value, { stream: true });
    
                const lines = buffer.split('\n');
                buffer = lines.pop(); // 保存最后一个不完整的行
    
                for (let line of lines) {
                    if (line.startsWith('data:')) {
                        const jsonString = line.replace('data:', '').trim();
                        if (jsonString) {
                            const parsedData = JSON.parse(jsonString);
                            if (parsedData.data && parsedData.data.message && parsedData.data.message.content) {
                                const contentArray = parsedData.data.message.content;
                                for (let content of contentArray) {
                                    if (content.data && content.data.text) {
                                            // console.log('接收到text数据:', content.data.text);
                                            jsonBuffer += content.data.text;
                                            // console.log("整合",jsonBuffer)
                                            this.extractAndShowDescription(jsonBuffer);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            console.log('更新添加前:', jsonBuffer);
            jsonBuffer = jsonBuffer.replace(/\+(\d+)/g, '$1');
            jsonBuffer = jsonBuffer.replace(/^\`\`\`json|```$/g, '');
            console.log('转换json前:', jsonBuffer);
            const nestedJsonObject = JSON.parse(jsonBuffer);
            // console.log('解析嵌套json', nestedJsonObject);
            this.tokens++;
            this.#property.upDataSelection(nestedJsonObject);
            this.#property.upDataAI(nestedJsonObject.normal);
            console.log("AI发送数据", nestedJsonObject);
            this.freshProperty(); // 实时更新页面内容
            this.freshOption(); // 实时更新页面内容

            return nestedJsonObject;
    
        } catch (error) {
            console.error(error);
            const response = await fetch('https://agentapi.baidu.com/assistant/getAnswer?appId=' + appId + '&secretKey=' + secretKey);
            const responseData = await response.json();
            if (responseData.status === 1115 && this.#API === 1){
                window.alert("文心一言今日api调用额度已用完(500次),调用ai功能无效,启用2号")
                this.#API = 2
            }else if (responseData.status === 1115 && this.#API === 2){
                window.alert("文心一言2今日api调用额度已用完(500次),调用ai功能无效,只能当作原版了")
            }else{
                window.alert('文心一言模型又出问题了,等十秒左右直接闪现出来');
                this.wenXinAPIGetAnswer(inputText);
            }
            return;
        } finally {
            this.isFetching = false; // 在 API 调用后重置标志
        }
    }

    async wenXinAPIGetAnswer(inputText) {
        this.isFetching = true; // 在 API 调用前设置标志为 true
        const age = this.getLastRecord().AGE;
        console.log('发送文本',age + `岁的时候，` + inputText);
        let appId = 'HNKx1HzUJ2pBXOwxcXd4sdHApY7NozO0'
        let secretKey = '6QDRP3CUbLRjdPRJEwCgWIAz1aAUwGiV'
        if (this.#API === 2){
            appId = '9d8aLRdnMwaUBSYmHoUtvj9ScT0fXpbI';
            secretKey = 'fMAO8u9Z8eBZ2jozMchN0gslVWcLAr7s';
        }
        const openId = 'getanswer'; // Unique user ID
        const token ="24.01a37e70a772b7a0635313419ed5d429.2592000.1737377110.282335-116602943";
        const requestBody = {
            message: {
                content: {
                    type: "text",
                    value: {
                        showText: age + `岁的时候，` + inputText
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

                console.log("AI发送数据",nestedJsonObject)
                this.select(0);
                this.freshTotal();
                return nestedJsonObject
                


            } catch (error) {
                console.error(error)
                console.log('智障文心又乱给出错误格式的数据了');
            } finally {
                this.isFetching = false; // 在 API 调用后重置标志
            }
    }


    extractAndShowDescription(jsonBuffer) {
        const descriptions = [];
        const regex = /"description"\s*:\s*"([^"]*)"/g;
        let match;
        
        
        while ((match = regex.exec(jsonBuffer)) !== null) {
            descriptions.push(match[1]); 
        }
        if (descriptions.length !== this.#previousDescriptionsLength) {
            // console.log(descriptions,descriptions.length, this.#previousDescriptionsLength);
            this.#previousDescriptionsLength = descriptions.length;
            if (descriptions.length === 1) {
                this.updateText("#option1", descriptions[0]);
            } else if (descriptions.length === 2) {
                this.updateText("#option2", descriptions[1]);
            } else if (descriptions.length === 3) {
                this.updateText("#option3", descriptions[2]);
            } 
        }
    }

    updateText(id, txt) {

        const piece = txt.split("");
        let i = 0;
        const originalText = $(id).text().split("");
        const maxLength = Math.max(originalText.length, piece.length);
        const interval = setInterval(() => {
            if (i < maxLength) {
                if (i < piece.length) {
                    if (i < originalText.length) {
                        originalText[i] = piece[i];
                    } else {
                        originalText.push(piece[i]);
                    }
                } else {
                    originalText[i] = "";
                }
                $(id).text(originalText.join(""));
                i++;
                // console.log(i, originalText.join(""));
            } else {
                clearInterval(interval);
                // console.log(txt)
            }
            const lifeTrajectoryElement = $("#lifeTrajectory")[0];
            if (lifeTrajectoryElement) {
                $("#lifeTrajectory").scrollTop(lifeTrajectoryElement.scrollHeight);
            }
        }, 150); // Adjust the interval time as needed
    }
    
    

    select(option,inputText){
        const selections = this.getLastRecord().SEL;
        let formattedData;
        let id;
        if (option === 0) {
            id = "selection1"
            formattedData = {
                CHR: selections.normal.CHR,
                INT: selections.normal.INT,
                STR: selections.normal.STR,
                MNY: selections.normal.MNY,
                SPR: selections.normal.SPR,
            };
        } else if (option === 1) {
            id = "selection1"
            formattedData = {
                CHR: selections.selection1.CHR,
                INT: selections.selection1.INT,
                STR: selections.selection1.STR,
                MNY: selections.selection1.MNY,
                SPR: selections.selection1.SPR,
            };
        } else if (option === 2) {
            id = "selection2"
            formattedData = {
                CHR: selections.selection2.CHR,
                INT: selections.selection2.INT,
                STR: selections.selection2.STR,
                MNY: selections.selection2.MNY,
                SPR: selections.selection2.SPR,
            };
        } else if (option === 3) {
            id = "selection3";
            formattedData = {
                CHR: selections.selection3.CHR,
                INT: selections.selection3.INT,
                STR: selections.selection3.STR,
                MNY: selections.selection3.MNY,
                SPR: selections.selection3.SPR,
            };
        } else if(option === 4) {
            id = "selection4"
            this.wenXinAPI(inputText);
        }
        // 添加到页面
        if (option >= 1 && option <= 3) {
            let season;
            switch (this.#process.length) {
                case 0:
                    season = '春：';
                    break;
                case 1:
                    season = '夏：';
                    break;
                case 2:
                    season = '秋：';
                    break;
                case 3:
                    season = '冬：';
                    break;
                default:
                    season = '';
            }
            const li = $(`<li><span>${season}</span><span>${selections[id].description}</span></li>`);
            li.appendTo('#lifeTrajectory');
            this.freshText(this.getLastRecord(),option);
            // 更新属性到网页数据
            this.#property.upDataAI(formattedData.id);

            this.selectionBack(id)            
            this.#event.addSelections(this.#currentEvent);
            // 更新点数
            this.freshProperty();
        }else if (option == 4) {
            this.freshTotal();
            let season;
            switch (this.#process.length) {
                case 0:
                    season = '春：';
                    break;
                case 1:
                    season = '夏：';
                    break;
                case 2:
                    season = '秋：';
                    break;
                case 3:
                    season = '冬：';
                    break;
                default:
                    season = '';
            }
            const li = $(`<li><span>${season}</span><span>${inputText}</span></li>`);
            li.appendTo('#lifeTrajectory');
            if (this.#process.length < 3) {
                this.#process.push(id);
            }else{
                this.#process = [];
                setTimeout(() => {
                    $("#selection").html(`
                        <li id="option1" style="user-select:auto;">今年已结束</li>
                        <li id="option2" style="user-select:auto;">今年已结束</li>
                        <li id="option3" style="user-select:auto;">今年已结束</li>
                        <li>
                        <input type="text" id="option4" aria-label="Input Text" style="width:100%;padding: 0; font-size: 1rem;text-align: center;margin:3px;">
                        <input type="submit" aria-label="Submit" class="mainbtn" style=" padding: 5px; font-size: 1rem;  text-align: center;margin:3px;">
                        </li>
                    `);
                }, 200);
            }
        }else{
            this.freshTotal();
        }

    }

    selectionBack(id) {
        if (this.#process.length < 3) {
            console.log('添加流程前', this.#process);
            this.#process.push(id);
            console.log('添加流程', this.#process);
            let path = 'selections';
            for (let i = 0; i < this.#process.length; i++) {
                path += `.${this.#process[i]}.selections`;
            }
            console.log('检索嵌套层次', path);
            this.checkSelections1(this.getLastRecord().SEL[id].description, path);
        } else {
            this.#process = [];
            setTimeout(() => {
                $("#selection").html(`
                    <li id="option1" style="user-select:auto;">今年已结束</li>
                    <li id="option2" style="user-select:auto;">今年已结束</li>
                    <li id="option3" style="user-select:auto;">今年已结束</li>
                    <li>
                    <input type="text" id="option4" aria-label="Input Text" style="width:100%;padding: 0; font-size: 1rem;text-align: center;margin:3px;">
                    <input type="submit" aria-label="Submit" class="mainbtn" style=" padding: 5px; font-size: 1rem;  text-align: center;margin:3px;">
                    </li>
                `);
            }, 2000);
        }
    }

    freshProperty(){
        const property = this.getLastRecord();
        console.log('更新页面输入',property)
        const tokens = this.getStoredTokens();
        $("#lifeProperty").html(`
            <li ><span>调用</span><span>${tokens}</span></li>
            <li><span>颜值</span><span>${property.LSCHR}${property.CHCHR >= 0 ? '+' : ''} ${property.CHCHR}</span></li>
            <li><span>智力</span><span>${property.LSINT}${property.CHINT >= 0 ? '+' : ''} ${property.CHINT}</span></li>
            <li><span>体质</span><span>${property.LSSTR}${property.CHSTR >= 0 ? '+' : ''} ${property.CHSTR}</span></li>
            <li><span>家境</span><span>${property.LSMNY}${property.CHMNY >= 0 ? '+' : ''} ${property.CHMNY}</span></li>
            <li><span>快乐</span><span>${property.LSSPR}${property.CHSPR >= 0 ? '+' : ''} ${property.CHSPR}</span></li>
        `)
    }

    freshOption(){
        const property = this.getLastRecord();
        $("#selection").html(`
            <li id="option1" style="user-select:auto;">${property.SEL.selection1.description}</li>
            <li id="option2" style="user-select:auto;">${property.SEL.selection2.description}</li>
            <li id="option3" style="user-select:auto;">${property.SEL.selection3.description}</li>
            <li>
            <input type="text" id="option4" aria-label="Input Text" style="width:100%;padding: 0; font-size: 1rem;text-align: center;margin:3px;">
            <input type="submit" aria-label="Submit" class="mainbtn" style=" padding: 5px; font-size: 1rem;  text-align: center;margin:3px;">
            </li>
        `);
    }
    
    // 更新页面
    freshTotal() {
        setTimeout(() => {
            const property = this.getLastRecord();
            console.log('更新页面输入', property)
            const tokens = this.getStoredTokens();
            $("#lifeProperty").html(`
                <li><span>调用</span><span>${tokens}</span></li>
                <li><span>颜值</span><span>${property.LSCHR}${property.CHCHR >= 0 ? '+' : ''} ${property.CHCHR}</span></li>
                <li><span>智力</span><span>${property.LSINT}${property.CHINT >= 0 ? '+' : ''} ${property.CHINT}</span></li>
                <li><span>体质</span><span>${property.LSSTR}${property.CHSTR >= 0 ? '+' : ''} ${property.CHSTR}</span></li>
                <li><span>家境</span><span>${property.LSMNY}${property.CHMNY >= 0 ? '+' : ''} ${property.CHMNY}</span></li>
                <li><span>快乐</span><span>${property.LSSPR}${property.CHSPR >= 0 ? '+' : ''} ${property.CHSPR}</span></li>
            `);

            //更新选项
            this.updateText("#option1", property.SEL.selection1.description);
            this.updateText("#option2", property.SEL.selection2.description);
            this.updateText("#option3", property.SEL.selection3.description);

            $("#selection").html(`
                <li id="option1" style="user-select:auto;">${property.SEL.selection1.description}</li>
                <li id="option2" style="user-select:auto;">${property.SEL.selection2.description}</li>
                <li id="option3" style="user-select:auto;">${property.SEL.selection3.description}</li>
                <li>
                <input type="text" id="option4" aria-label="Input Text" style="width:100%;padding: 0; font-size: 1rem;text-align: center;margin:3px;">
                <input type="submit" aria-label="Submit" class="mainbtn" style=" padding: 5px; font-size: 1rem;  text-align: center;margin:3px;">
                </li>
            `);

            console.log('AI更新页面点数变化',
                property.CHCHR,
                property.CHINT,
                property.CHSTR,
                property.CHMNY,
                property.CHSPR)
        }, 200);
    }

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
        this.#process = [];
        this.#currentEvent = this.#event.get(eventId);
        
        console.log('当前事件',this.#currentEvent)
        this.checkSelections(description);

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
