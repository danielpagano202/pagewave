import { EndTransitionRequest } from "./EndTransitionRequest";
import { SendTransitionRequest } from "./SendTransitionRequest";

export type ListenForChangeRequest = {
    sendTransitionRequest: SendTransitionRequest;
    endTransitionRequest: EndTransitionRequest;
};
