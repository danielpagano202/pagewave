import { PageWave } from "../classes/PageWave";
import { TransitionStyle } from "./TransitionStyleInterface";

export type HookType = {
    pagewave: PageWave;
    style: TransitionStyle;
    event?: Event;
};
