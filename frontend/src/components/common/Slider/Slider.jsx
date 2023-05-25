import { memo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useSettingsStore } from "../../../stores/settings/settings";
import "./Slider.css";

const Slider = memo(() => {
	const volume = useSettingsStore((state) => state.volume);
	const changeVolume = useSettingsStore((state) => state.changeVolume);

	const prevX = useRef(0);
	const trackRef = useRef(null);
	const thumbRef = useRef(null);

	const mouseDownHandler = useCallback((e) => {
		e?.stopPropagation();
		e?.preventDefault();
	  	console.log("Clicked!");
	  	const moveThumb = (_e) => {
			_e?.preventDefault();
			_e?.stopPropagation();
			console.log("Moved!");
			const _prevX = prevX.current;
			const rightBorder = trackRef.current.offsetWidth - thumbRef.current.clientWidth;
			let offset = parseInt(thumbRef.current.style.left, 10) + _e.movementX;
			offset = offset < 0 ? 0 : offset > rightBorder ? rightBorder : offset;
	
			console.log({ pageX: _e });

			changeVolume(offset / 100);
			prevX.current = e.pageX || 0;
	 	}
  
		const forbidMoving = (e) => {
			e?.stopPropagation();
			e?.preventDefault();
			window.removeEventListener("mousemove", moveThumb);
			window.removeEventListener("mouseup", forbidMoving);
			window.removeEventListener("mouseup", forbidMoving);
		};
  
		window.addEventListener("mousemove", moveThumb);
		window.addEventListener("mouseup", forbidMoving);
		window.addEventListener("mouseup", forbidMoving);
	}, [trackRef, thumbRef]);
	
	useLayoutEffect(() => {
		if(thumbRef.current) {
			thumbRef.current.addEventListener("mousedown", mouseDownHandler);
		}
  
		return () => {
			if(thumbRef.current) {
				thumbRef.current.removeEventListener("mousedown", mouseDownHandler);
			}
		}
	}, [mouseDownHandler]);
	
	useEffect(() => {
		if (thumbRef.current) {
			thumbRef.current.style.left = `${volume * trackRef.current.clientWidth}px`;
		}
	}, [volume, thumbRef, trackRef]);

	console.log("Slider rendered!");

	return (
		<div>
			<div ref={trackRef} className="wl-cb-slider-track">
				<div ref={thumbRef} className="wl-cb-slider-thumb"></div>
			</div>
		</div>
	);
});

export default Slider;