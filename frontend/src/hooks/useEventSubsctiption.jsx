/* react */
import { useEffect, useLayoutEffect, useRef } from "react"

/* scripts */
import { getRootElement } from "../scripts/getRootElement";

const subscribe = (eventType, eventCallback, getElementId) => {
	const id = getElementId();
	if(id) {
		const element = document.getElementById(id);
		return element && element.addEventListener(eventType, eventCallback);
	}

	getRootElement().addEventListener(eventType, eventCallback);
};

const unsubscribe = (eventType, eventCallback, getElementId) => {
	console.log("Unsubed!");

	const id = getElementId();
	if(id) {
		const element = document.getElementById(id);
		return element && element.addEventListener(eventType, eventCallback);
	}

	getRootElement().removeEventListener(eventType, eventCallback);
};

export const useEventSubscription = (eventType, eventCallback, id) => {
	const idRef = useRef(id);
	const callbackRef = useRef(eventCallback);

	useLayoutEffect(() => {
		callbackRef.current = eventCallback;
	}, [eventCallback]);

	const subscriptionEffect = () => {
		console.log("Subscription Effect Called.")
		const intermediateFunction = (e) => callbackRef.current(e);
		const getElementId = () => idRef.current;
		subscribe(eventType, intermediateFunction, getElementId);
		return () => unsubscribe(eventType, intermediateFunction, getElementId);
	}

	useEffect(subscriptionEffect, [eventType]);

	console.log("useEventSubscription Rendered!");
	
	return null;
}