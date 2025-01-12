import { clone } from './functions/util.js';
import { checkCondition } from './functions/condition.js';
import { saveAs } from 'file-saver';

class Event {
    constructor() {
    }

    #events;


    initial({ events }) {
        this.#events = events;
        for (const id in events) {
            const event = events[id];
            if (!event.branch) continue;
            event.branch = event.branch.map(b => {
                if (typeof b === 'string') {
                    b = b.split(':');
                    b[1] = Number(b[1]);
                }
                return b;
            });
        }
    }

    count() {
        return Object.keys(this.#events).length;
    }

    check(eventId, property) {
        const { include, exclude, NoRandom } = this.get(eventId);
        if (NoRandom) return false;
        if (exclude && checkCondition(property, exclude)) return false;
        if (include) return checkCondition(property, include);
        return true;
    }

    get(eventId) {
        const event = this.#events[eventId];
        if (!event) throw new Error(`[ERROR] No Event[${eventId}]`);
        return clone(event);
    }

    information(eventId) {
        const { event: description } = this.get(eventId);
        return { description };
    }

    do(eventId, property) {
        const { effect, branch, event: description, postEvent } = this.get(eventId);
        if (branch)
            for (const [cond, next] of branch)
                if (checkCondition(property, cond))
                    return { effect, next, description };
        return { effect, postEvent, description };
    }

    // 添加AI选项
    addSelections(currentEvent) {
        this.#events[currentEvent.id] = currentEvent;
        console.log("已添加到events", this.#events[currentEvent.id]);
    }

    // 写入事件
        writeEvents() {
            const jsonString = JSON.stringify(this.#events, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            saveAs(blob, 'events.json');
            console.log("Events have been saved as events.json");
        }
    }

export default Event;
