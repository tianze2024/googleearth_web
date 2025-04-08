import { Ref } from "vue";
import { Destroyable } from "xbsj-xe2/dist-node/xe2-base-utils";

export type ChannelItemType = [id: string, startTimeStamp: number, duration: number]

export abstract class Dragger extends Destroyable {
    protected _startX = this._event.offsetX
    protected _target = this._event.target as HTMLElement
    protected _pointerId = this._event.pointerId
    constructor(protected _event: PointerEvent, protected _xScale: Ref<number>) {
        super();
        this._target.setPointerCapture(this._pointerId)
        this.dispose(() => this._target.releasePointerCapture(this._pointerId))
    }
    abstract update(event: PointerEvent): void
}


export class CurrentTimeLineDragger extends Dragger {
    private _start = this._currentTimeRef.value
    constructor(event: PointerEvent, xScale: Ref<number>, private _currentTimeRef: Ref<number>) {
        super(event, xScale)
    }

    update(event: PointerEvent) {
        const diff = (event.offsetX - this._startX) / this._xScale.value
        this._currentTimeRef.value = this._start + diff
    }
}

export class LastTimeLineDragger extends Dragger {
    private _start = this._durationRef.value
    constructor(event: PointerEvent, xScale: Ref<number>, private _durationRef: Ref<number>) {
        super(event, xScale)
    }

    update(event: PointerEvent) {
        const diff = (event.offsetX - this._startX) / this._xScale.value
        this._durationRef.value = this._start + diff
    }
}

export class PlayingRectLineDragger extends Dragger {
    private _id: string;
    private _start: number;
    private _duration: number;

    constructor(event: PointerEvent, xScale: Ref<number>, private _channelIndex: number, private _channelsRef: Ref<ChannelItemType[] | undefined>) {
        super(event, xScale)
        const channelsRef = this._channelsRef;
        const channels = channelsRef.value
        if (!channels) {
            throw new Error(`!channels`)
        }
        const channel = channels[this._channelIndex]
        if (!channel) {
            throw new Error(`!channel`)
        }
        ([this._id, this._start, this._duration] = channel)
    }

    update(event: PointerEvent) {
        const channelsRef = this._channelsRef;
        const diff = (event.offsetX - this._startX) / this._xScale.value
        const channels = channelsRef.value
        if (channels) {
            const channel = channels[this._channelIndex];
            channel.splice(0, 3, this._id, this._start + diff, this._duration);
        }
    }
}

export class PlayingChannelLeftLineDragger extends Dragger {
    private _id: string;
    private _start: number;
    private _duration: number;

    constructor(event: PointerEvent, xScale: Ref<number>, private _channelIndex: number, private _channelsRef: Ref<ChannelItemType[] | undefined>) {
        super(event, xScale)
        const channelsRef = this._channelsRef;
        const channels = channelsRef.value
        if (!channels) {
            throw new Error(`!channels`)
        }
        const channel = channels[this._channelIndex]
        if (!channel) {
            throw new Error(`!channel`)
        }
        ([this._id, this._start, this._duration] = channel)
    }

    update(event: PointerEvent) {
        const channelsRef = this._channelsRef;
        const diff = (event.offsetX - this._startX) / this._xScale.value
        const channels = channelsRef.value
        if (channels) {
            const channel = channels[this._channelIndex];
            if (diff < this._duration) {
                channel.splice(0, 3, this._id, this._start + diff, this._duration - diff);
            }
        }
    }
}

export class PlayingChannelRightLineDragger extends Dragger {
    private _id: string;
    private _start: number;
    private _duration: number;

    constructor(event: PointerEvent, xScale: Ref<number>, private _channelIndex: number, private _channelsRef: Ref<ChannelItemType[] | undefined>) {
        super(event, xScale)
        const channelsRef = this._channelsRef;
        const channels = channelsRef.value
        if (!channels) {
            throw new Error(`!channels`)
        }
        const channel = channels[this._channelIndex]
        if (!channel) {
            throw new Error(`!channel`)
        }
        ([this._id, this._start, this._duration] = channel)
    }

    update(event: PointerEvent) {
        const channelsRef = this._channelsRef;
        const diff = (event.offsetX - this._startX) / this._xScale.value
        const channels = channelsRef.value
        if (channels) {
            const channel = channels[this._channelIndex];
            if (this._duration + diff > 0) {
                channel.splice(0, 3, this._id, this._start, this._duration + diff);
            }
        }
    }
}
