const canvas = document.querySelector('#c');

// init with the default canvas size
const canvasToDisplaySizeMap = new Map([[canvas, [300, 150]]]);

function onResize(entries) {
	for (let i = 0; i < entries.length; i++) {
        const entry = entries[i] // all entries we're watching for a resize action
        let width;
        let height;
        let dpr = window.devicePixelRatio;
        if (entry.devicePixelContentBoxSize) {
            console.log('using devicePixelContentBoxSize for resize')
            // NOTE: Only this path gives the correct answer
            // The other paths are imperfect fallbacks
            // for browsers that don't provide anyway to do this
            width = entry.devicePixelContentBoxSize[0].inlineSize;
            height = entry.devicePixelContentBoxSize[0].blockSize;
            dpr = 1; // it's already in width and height
        } else if (entry.contentBoxSize) {
            if (entry.contentBoxSize[0]) {
                console.log('using content box size for resize')
                width = entry.contentBoxSize[0].inlineSize;
                height = entry.contentBoxSize[0].blockSize;
            } else {
                width = entry.contentBoxSize.inlineSize;
                height = entry.contentBoxSize.blockSize;
            }
        } else {
            console.log('using contentRect for resize')
            width = entry.contentRect.width;
            height = entry.contentRect.height;
        }
        const displayWidth = Math.round(width * dpr);
        const displayHeight = Math.round(height * dpr);
        canvasToDisplaySizeMap.set(entry.target, [displayWidth, displayHeight]);
	}
}

const resizeObserver = new ResizeObserver(onResize);
try {
	// only call us of the number of device pixels changed
	resizeObserver.observe(canvas, {box: 'device-pixel-content-box'});
} catch (ex) {
	// device-pixel-content-box is not supported so fallback to this
	resizeObserver.observe(canvas, {box: 'content-box'});
}

function resizeCanvasToDisplaySize(canvas) {
    const [displayWidth, displayHeight] = canvasToDisplaySizeMap.get(canvas);
    const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;
    if (needResize) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
    return needResize;
}

export default onResize;
