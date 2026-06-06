# <https://perchance.org/text-to-image-plugin>

## Perchance Left Side

```perchance

// NOTE TO SELF: If you add more properties, make sure you add to the regex below, and the variable declarations in each 'branch'

$output(data, opts) =>
  if(data === undefined) return "(Error: you've input an empty value/variable into the text-to-image-plugin)";

  // Allow for `await generateImage("a cute cat", {resolution:"512x768", removeBackground:true})` type usage
  if(opts && typeof opts === "object") {
    opts.prompt = data;
    data = opts;
  }
  
  // if(options === undefined) options = {};
  
  let serverOrigin = "https://image-generation.perchance.org";
  
  let evaluatedInputs;
  
  // This is used for the heart-button gallery. It's a bit hacky, but most often devs will want the "open gallery" button to show a gallery with e.g. the same moderation options as the gallery that they've displayed on the page, if any.
  window.lastUsedTextToImagePluginGalleryIframeUrl = null;
  
  let shouldRemoveIframeOnFinish = false; // for the case where the iframe was added automatically - i.e. when called like:  `let result = await image({prompt:"a cute mouse"})`

  let galleryOptionsHash = null; // only used if this is a gallery call

  ////////////////////////////////////////////////
  //       set up handler for gallery           //
  ////////////////////////////////////////////////
  let pluginData;
  if(!window.___textToImagePluginData98420274) {
    window.addEventListener("message", function(e) {
      let origin = e.origin || e.originalEvent.origin;
      if(origin !== serverOrigin) {
        return;
      }
      if(e.data.openGallerySignal) {
        let ctn = document.createElement("div");
        let subChannelName = e.data.subChannelName;
        let url;
        if(window.lastUsedTextToImagePluginGalleryIframeUrl) {
          url = new URL(window.lastUsedTextToImagePluginGalleryIframeUrl);
          url.searchParams.set("subChannelName", subChannelName);
          url = url.href;
        } else {
          url = `${serverOrigin}/gallery?channel=${window.generatorName}&subChannel=${encodeURIComponent(subChannelName)}&sort=trending&timeRange=1-month&contentFilter=pg13`;
        }
        let backgroundColor = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "#242424" : "white";
        ctn.innerHTML = `<div onclick="this.remove()" style="backdrop-filter:brightness(0.3);position:fixed;top:0;left:0;right:0;bottom:0;z-index:999;"><div style="position:fixed;top:5vh;bottom:5vh;left:5vh;right:5vh;background:${backgroundColor};border-radius:3px;"><iframe src="${url}" style="border:0;width:100%;height:100%;"></iframe></div></div>`;
        document.body.appendChild(ctn.firstElementChild);
      }
      if(e.data.savedImageToGallerySignal) {
        document.querySelectorAll(".text-to-image-plugin-gallery").forEach(el => {
          let targetOrigin = serverOrigin;
          el.contentWindow.postMessage({doRefreshIfSortingByRecent:true}, targetOrigin);
          
          // the code below is commented out because it doesn't work for the case where the user has switched the sort to recent (since, counter-intuitively, iframe's window.location can change, while iframe.src stays as the original value - I'm assuming this is due to cross-origin security stuff)
          // if(el.src.includes("sort=recent")) {
          //   // refresh galleries that are sorted by recent if the user makes a submission
          //   let url = new URL(el.src);
          //   url.searchParams.set("cacheBust", Math.random().toString());
          //   el.src = ""; // we do this instead of el.src=el.src because that doesn't work if the URL has a hash in it, and I might need to add data in the hash later
          //   setTimeout(() =>el.src=url.href, 700); // we need to wait a bit for the iframe to actually initiate a reload/refresh before setting the src again
          // }
        });
      }
      if(e.data.documentHeightChanged) {
        document.querySelectorAll(".text-to-image-plugin-gallery").forEach(el => {
          if(el.dataset.adaptiveHeight === "yes") {
            el.style.height = (e.data.newHeight+1)+"px";
            console.debug("Updated gallery height", e.data.newHeight);
          }
        });
      }
      if(e.data.customButtonClickEvent) {
        if(e.data.isButton2) {
          let handlerFn = pluginData.galleryCustomButton2ClickHandlers[e.data.galleryInstanceId];
          if(handlerFn) handlerFn(e.data.onClickHandlerData);
        } else {
          let handlerFn = pluginData.galleryCustomButtonClickHandlers[e.data.galleryInstanceId];
          if(handlerFn) handlerFn(e.data.onClickHandlerData);
        }
      }
    });
    window.___textToImagePluginData98420274 = {
      galleryCustomButtonClickHandlers: {},
      galleryCustomButton2ClickHandlers: {},
    };
  }
  pluginData = window.___textToImagePluginData98420274;
  
  if(data.gallery) {
    // NOTE: this is a somewhat 'breaking' change, but I'm no longer allowing unfiltered content to be shown by default.
    // The user must specifically choose to switch the gallery to unfiltered mode.
    data.contentFilter = "pg13";
  
    let sort = data.sort ? data.sort.evaluateItem : "recent";
    if(sort === "best") sort = "top"; // alias
    
    let contentFilter = data.contentFilter ? data.contentFilter.evaluateItem.toLowerCase() : "pg13";
    if(contentFilter === "pg-13") contentFilter = "pg13";
    
    let bannedUsers = data.bannedUsers ? data.bannedUsers.selectAll.map(item => item.toString()) : [];
    let bannedPromptPhrases = data.bannedPromptPhrases ? data.bannedPromptPhrases.selectAll.map(item => item.getRawListText.replace("/\\^", "/^")) : [];
    let bannedNegativePromptPhrases = data.bannedNegativePromptPhrases ? data.bannedNegativePromptPhrases.selectAll.map(item => item.getRawListText.replace("/\\^", "/^")) : [];

    let defaultSubChannelNames = [];
    if(data.defaultGalleryNames) {
      if(typeof data.defaultGalleryNames === "string") {
        defaultSubChannelNames = data.defaultGalleryNames.split(",").map(name => name.trim()).filter(name => name && /^[a-z0-9\-]+$/.test(name));
      } else {
        defaultSubChannelNames = data.defaultGalleryNames.selectAll.map(item => item+"");
      }
    }
    
    let timeRange = data.timeRange ? data.timeRange.evaluateItem : (sort === "recent" ? "all-time" : "1-month");
    let hideIfScoreIsBelow = data.hideIfScoreIsBelow !== undefined ? Number(data.hideIfScoreIsBelow.evaluateItem) : -1000000000;
    if(isNaN(hideIfScoreIsBelow)) hideIfScoreIsBelow = -1000000000;
    
    let galleryOptions = {sort, timeRange, hideIfScoreIsBelow, contentFilter, subChannel:"public"}; // this is also used for checking if gallery options have been udpated (see below)
    if(data.forceColorScheme) galleryOptions.forceColorScheme = data.forceColorScheme;

    const galleryInstanceId = "galleryInstanceId"+(Math.random().toString()+Math.random().toString()).replaceAll(".", "");
    
    let customButtonEmoji = null;
    let shouldShowCustomButton = false;
    let customButtonOptions = data.customButton || data.customButton1;
    if(customButtonOptions) {
      shouldShowCustomButton = true;
      if(customButtonOptions.onClick) pluginData.galleryCustomButtonClickHandlers[galleryInstanceId] = customButtonOptions.onClick;
      if(customButtonOptions.emoji) customButtonEmoji = customButtonOptions.emoji.evaluateItem;
    }

    let customButton2Emoji = null;
    let shouldShowCustomButton2 = false;
    if(data.customButton2) {
      shouldShowCustomButton2 = true;
      if(data.customButton2.onClick) pluginData.galleryCustomButton2ClickHandlers[galleryInstanceId] = data.customButton2.onClick;
      if(data.customButton2.emoji) customButton2Emoji = data.customButton2.emoji.evaluateItem;
    }
    
    let hashData = {galleryInstanceId, shouldShowCustomButton, customButtonEmoji, shouldShowCustomButton2, customButton2Emoji, bannedUsers, bannedPromptPhrases, bannedNegativePromptPhrases, injectedStyles:{}, defaultSubChannelNames};
    if(data.style) {
      let style = data.style.evaluateItem.trim();
      if(style.includes("background:")) {
        hashData.injectedStyles.background = (style.match(/(?:^|;) *background:(.+?)(?:;|$)/) || [])[1];
      } else if(style.includes("background-color:")) {
        hashData.injectedStyles.background = (style.match(/(?:^|;) *background-color:(.+?)(?:;|$)/) || [])[1];
      }
    }
    
    let otherUrlParams = {channel:window.generatorName};
    let iframeUrl = new URL(`${serverOrigin}/gallery`);
    Object.entries(galleryOptions).forEach(([key, value]) => iframeUrl.searchParams.set(key, value));
    Object.entries(otherUrlParams).forEach(([key, value]) => iframeUrl.searchParams.set(key, value));
    
    
    function makeGalleryIframeHtml() {
      let url = iframeUrl.href + `#data=${encodeURIComponent(JSON.stringify(hashData))}`;
      window.lastUsedTextToImagePluginGalleryIframeUrl = url;
      return `<iframe data-gallery-options="${encodeURIComponent(JSON.stringify(galleryOptions))}" data-adaptive-height="${data.adaptiveHeight ? "yes" : "no"}" style="width:100%; height:70vh; border:none; ${data.style || ""}" class="text-to-image-plugin-gallery" src="${url}" allow="clipboard-write"></iframe>`;
    }
    
    if(!document.querySelector(".text-to-image-plugin-gallery")) {
      setTimeout(() => {
        let marker = document.querySelector("#temporaryMarkerElForTextToImageGallery84738932");
        if(marker) marker.outerHTML = makeGalleryIframeHtml()
      }, 50);
      return `<span id="temporaryMarkerElForTextToImageGallery84738932"></span>`;
    } else {
      // update any gallery parameters if they have been changed:
      let galleryIframe = document.querySelector(".text-to-image-plugin-gallery");
      let newGalleryOptionsText = encodeURIComponent(JSON.stringify(galleryOptions));
      if(galleryIframe.dataset.galleryOptions !== newGalleryOptionsText) {
        galleryIframe.outerHTML = makeGalleryIframeHtml();
      }
      return "";
    }
  }
  
  
  
  
  
  ///////////////////////////////////////////////////////////////////////////////////////
  //              parse and evaluate prompt data/options from input                    //
  ///////////////////////////////////////////////////////////////////////////////////////
  const defaultGuidanceScale = 7;
  
  let d = {}; 
  // let dataInputWasNotAnOptionsObject = false;
  
  if(data.prompt === undefined) {
    d.prompt = data.evaluateItem.toString(); // they passed in some text directly like [image("a carrot")]
  } else {
    d.prompt = data.prompt.evaluateItem.toString();
  }
  // Apply some covenience fixes to the prompt, even though the plugin user should ideally fix this on their end:
  d.prompt = d.prompt.replace(/<span [^>]+______tippy-tooltip-[^>]+>(.+?)<\/span>/, "$1");
  
  // parse values from prompts like: `this is the prompt text (size:::400) (resolution:::512x768) (guidanceScale:::10)`
  if(d.prompt.includes(":::")) {
    let matches = [...d.prompt.matchAll(/\((seed|size|style|resolution|width|height|guidanceScale|saveTitle|saveDescription)\:\:\:/g)];
    // console.debug("matches:", matches);
    const numericProps = ["seed", "width", "height", "guidanceScale", "width", "height", "size"];
    for(let match of matches) {
      let re = new RegExp(`\\(${match[1]}\\:\\:\\:(.+?)\\).*?(?:\\:\\:\\:|$)`, "m");
      let value = (d.prompt.match(re) || [])[1]
      let key = match[1];
      if(value !== undefined) {
        d[key] = numericProps.includes(key) ? Number(value) : value;
        d.prompt = d.prompt.replace(`(${key}:::${value})`, "");
      }
    }
    d.prompt = d.prompt.trim();
  }
  if(!window.___t2i__parseNegativePrompt) {
    window.___t2i__parseNegativePrompt = function(str) {
      const prefix = '(negativePrompt:::';
      const start = str.indexOf(prefix);
      if (start === -1) return null;
      let depth = 0;
      let result = '';
      for(let i = start + prefix.length; i < str.length; i++) {
        if(str[i] === '(') {
          depth++;
        } else if (str[i] === ')') {
          if(depth === 0) {
            break;
          }
          depth--;
        }
        result += str[i];
      }
      return result;
    };
  }
  if(d.prompt.includes("(negativePrompt:::")) {
    let result = window.___t2i__parseNegativePrompt(d.prompt);
    if(result) {
      d.negativePrompt = result;
      d.prompt = d.prompt.replace(`(negativePrompt:::${d.negativePrompt})`, "");
      d.prompt = d.prompt.replace(`(negativePrompt:::${d.negativePrompt}`, ""); // since if final bracket is missing, then all following text is considered the negative prompt
    }
    d.prompt = d.prompt.trim();
  }
  
  if(!data.prompt) { // they passed in some text directly like [image("a carrot")], so add some defaults/fallbacks.
    if(d.seed === undefined) d.seed = -1;
    if(d.width === undefined) d.width = 300;
    if(d.height === undefined) d.height = 300;
    if(d.resolution === undefined) d.resolution = "512x512";   
    if(d.guidanceScale === undefined) d.guidanceScale = defaultGuidanceScale;
    if(d.negativePrompt === undefined) d.negativePrompt = "";
    if(d.style === undefined) d.style = "";
  }
  
  
  // EDIT: Not going ahead with this for now in favor of a setting a global variable which contains data on the last-used prompt.
  // // NOTE: Originally `data` was the only param and it could be the prompt, or a promptOptions object/list.
  // // But I realised that it's not very ergonomic (see e.g. reddit.com/r/perchance/comments/yta11r), so now, in a backwards-compatible way,
  // // I'm allowing the user to pass the options as the second parameter instead. This just means that if data is a prompt (rather than a
  // // promptOptions object), then we use the `options` parameter (which defaults to an empty object) for the generation options:
  // if(dataInputWasNotAnOptionsObject) {
  //   data = options; // this
  // }
  
  if(!d.seed) d.seed = data.seed ? data.seed.evaluateItem : -1;
  if(!d.resolution) d.resolution = data.resolution ? data.resolution.evaluateItem : "512x512";
  if(!d.guidanceScale) d.guidanceScale = data.guidanceScale ? data.guidanceScale.evaluateItem : defaultGuidanceScale;
  if(!d.negativePrompt) d.negativePrompt = data.negativePrompt ? data.negativePrompt.evaluateItem : "";
  if(!d.width) d.width = data.width ? data.width.evaluateItem : undefined; 
  if(!d.height) d.height = data.height ? data.height.evaluateItem : undefined; 
  if(!d.style) d.style = data.style ? data.style.evaluateItem : "";
  if(!d.saveTitle) d.saveTitle = data.saveTitle ? data.saveTitle.evaluateItem : "";
  if(!d.saveDescription) d.saveDescription = data.saveDescription ? data.saveDescription.evaluateItem : "";
  
  
  // NOTE: This stuff is not longer needed because we do the parsing above regardless of whether they passed a plain string in, or a promptOptions object.
  // // if seed is specified within the prompt with the (key:::value) format - i.e. they used promptOptions input but specified the seed within promptOptions.prompt, and so long as promptOptions.seed is not specified, then we set the seed to the one specified in the prompt:
  // if(data.seed === undefined && d.prompt.includes("(seed:::")) {
  //   let seed = null;
  //   d.prompt = d.prompt.replace(/\(seed:::([0-9]+)\)/g, (m, p1) => { seed=Number(p1); return ""; });
  //   if(seed) {
  //     d.seed = seed;
  //   }
  // }
  // // same for guidanceScale:
  // if(data.guidanceScale === undefined && d.prompt.includes("(guidanceScale:::")) {
  //   let guidanceScale = null;
  //   d.prompt = d.prompt.replace(/\(guidanceScale:::([0-9]+)\)/g, (m, p1) => { guidanceScale=Number(p1); return ""; });
  //   if(guidanceScale) {
  //     d.guidanceScale = guidanceScale;
  //   }
  // }
  // // same for width:
  // if(data.guidanceScale === undefined && d.prompt.includes("(width:::")) {
  //   let width = null;
  //   d.prompt = d.prompt.replace(/\(width:::([0-9]+)\)/g, (m, p1) => { width=Number(p1); return ""; });
  //   if(width) {
  //     d.width = width;
  //   }
  // }
  // // same for height:
  // if(data.guidanceScale === undefined && d.prompt.includes("(height:::")) {
  //   let height = null;
  //   d.prompt = d.prompt.replace(/\(height:::([0-9]+)\)/g, (m, p1) => { height=Number(p1); return ""; });
  //   if(height) {
  //     d.height = height;
  //   }
  // }
  // // same for size:
  // if(data.guidanceScale === undefined && d.prompt.includes("(size:::")) {
  //   let size = null;
  //   d.prompt = d.prompt.replace(/\(size:::([0-9]+)\)/g, (m, p1) => { size=Number(p1); return ""; });
  //   if(size) {
  //     d.size = size;
  //   }
  // }
  
  
  ////////////////////////////////////////////////
  //           sanity checks on inputs          //
  ////////////////////////////////////////////////
  
  if(d.size && d.resolution && d.resolution.split("x")[0] !== d.resolution.split("x")[1]) {
    return `(text-to-image-plugin: <b>size</b> is only a valid parameter with square resolutions. use <b>width</b> and <b>height</b> instead)`;
  }

  if(d.guidanceScale < 1 || Math.round(d.guidanceScale) !== d.guidanceScale) {
    return `(text-to-image-plugin: <b>guidanceScale</b> should be a whole number between 1 and 30, inclusive)`;
  }
  
  if(!["512x512", "512x768", "768x512", "768x768"].includes(d.resolution)) {
    return "(text-to-image-plugin: Currently, the only valid resolutions are 512x512, 768x768, 512x768 and 768x512)";
  }
  
  
  
  ////////////////////////////////////////////////
  //        un-shortcut size/width/height       //
  ////////////////////////////////////////////////
  let resW = Number(d.resolution.split("x")[0]);
  let resH = Number(d.resolution.split("x")[1]);
  let widthHeightCss = "";
  if(d.size) {
    let size = d.size.evaluateItem;
    if(typeof size === "number") size += "px";
    widthHeightCss = `width:${size}`;
  } else {
    if(d.width && !d.height) {
      d.width = d.width.evaluateItem;
      if(typeof d.width === "number") d.width += "px";
      widthHeightCss = `width:${d.width}`;
      // d.height = d.width * (resH/resW);
    } else if(!d.width && d.height) {
      d.height = d.height.evaluateItem;
      if(typeof d.height === "number") d.height += "px";
      widthHeightCss = `height:${d.height}`;
      // d.width = d.height * (resW/resH);
    } else if(!d.width && !d.height) {
      // make the smallest side 300px by default:
      let defaultSize = 300;
      if(d.resolution === "768x768") defaultSize = 450;
      if(resW > resH) {
        d.height = defaultSize;
        widthHeightCss = `height:${d.height}px`; // can't add max-height:100% here - it breaks stuff, like ai-character-chat
        // d.width = d.height * (resW/resH);
      } else {
        d.width = defaultSize;
        widthHeightCss = `width:${d.width}px`; // can't add max-width:100% here - it breaks stuff, like ai-character-chat
        // d.height = d.width * (resH/resW);
      }
    } else if(d.width && d.height) {
      if(typeof d.width === "number") d.width += "px";
      if(typeof d.height === "number") d.height += "px";
      widthHeightCss = `width:${d.width}; height:${d.height}`;
    }
  }
  
  if(d.style && /[;\s]?(width|height):/.test(d.style)) widthHeightCss = "";
  
  if(!CSS.supports("aspect-ratio", "1/2")) { // hackily help old browsers that don't support aspect-ratio if possible
    let width = (widthHeightCss.match(/width:([^;]+)px;?/) || [])[1];
    if(width && !widthHeightCss.includes("height") && !isNaN(Number(width))) {
      widthHeightCss += `; height:${Number(width) * (resH/resW)}px;`;
    }
    let height = (widthHeightCss.match(/height:([^;]+)px;?/) || [])[1];
    if(height && !widthHeightCss.includes("width") && !isNaN(Number(height))) {
      widthHeightCss += `; width:${Number(height) * (resW/resH)}px;`;
    }
  }
  
  let requestId = Math.random().toString();
  let privateIframeId = "id" + Math.random().toString().replace(".", "");
  
  // let iframePromiseResolver;
  // let iframePromise = new Promise(r => iframePromiseResolver=r);
  // let canvasPromiseResolver;
  // let canvasPromise = new Promise(r => canvasPromiseResolver=r);
  // let dataUrlPromiseResolver;
  // let dataUrlPromise = new Promise(r => dataUrlPromiseResolver=r);
  let onFinishPromiseResolver;
  let onFinishPromise = new Promise(r => onFinishPromiseResolver=r);
  

  async function messageHandler(event) {
    if(event.data.type === 'finished' && event.data.id === privateIframeId) {
      // TODO: Should remove this message handler when it's finished, but 
      
      function drawDataURLToCanvas(dataURL) {
        return new Promise((resolve, reject) => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            resolve(canvas);
          };
          img.src = dataURL;
        });
      }
      
      async function removeBackground(imageUrl) { // can be data url or normal URL
        if (!removeBackground.transformers) {
          const transformers = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3');
          transformers.env.allowLocalModels = false;
          transformers.env.backends.onnx.wasm.proxy = true;
          removeBackground.transformers = transformers;
        }
        
        const { AutoModel, AutoProcessor, RawImage } = removeBackground.transformers;
        if (!removeBackground.model || !removeBackground.processor) {
          removeBackground.model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
            config: { model_type: 'custom' },
          });
          
          removeBackground.processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4', {
            config: {
              do_normalize: true,
              do_pad: false,
              do_rescale: true,
              do_resize: true,
              image_mean: [0.5, 0.5, 0.5],
              feature_extractor_type: "ImageFeatureExtractor",
              image_std: [1, 1, 1],
              resample: 2,
              rescale_factor: 0.00392156862745098,
              size: { width: 1024, height: 1024 },
            }
          });
        }
        
        const image = await RawImage.fromURL(imageUrl);
        const { pixel_values } = await removeBackground.processor(image);
        const { output } = await removeBackground.model({ input: pixel_values });
        const mask = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(image.width, image.height);
        
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        
        // Draw original image output to canvas
        ctx.drawImage(image.toCanvas(), 0, 0);
        
        // Update alpha channel
        const pixelData = ctx.getImageData(0, 0, image.width, image.height);
        for (let i = 0; i < mask.data.length; ++i) {
          pixelData.data[4 * i + 3] = mask.data[i];
        }
        ctx.putImageData(pixelData, 0, 0);
        
        return canvas.toDataURL('image/png');
      }

      
      let dataUrl = event.data.dataUrl;
      if(data.removeBackground) {
        let pngDataUrlWithBgRemoved = await removeBackground(dataUrl).catch(console.error);
        if(pngDataUrlWithBgRemoved) dataUrl = pngDataUrlWithBgRemoved;
      }

      let canvas = await drawDataURLToCanvas(dataUrl);
      let iframe = document.querySelector(`iframe.${privateIframeId}`); // NOTE: may be null if it has been removed! (todo: keep original reference around instead of querySelector?)

      if(!iframe) window.removeEventListener('message', messageHandler); // iframes not in DOM cannot send any more messages
      
      let outputData = new String(dataUrl);
      outputData.canvas = canvas;
      outputData.iframe = iframe;
      outputData.dataUrl = dataUrl;
      outputData.inputs = evaluatedInputs;
      outputData.inputs.seed = event.data.seedUsed;
      
      if(iframe) iframe.textToImagePluginOutput = outputData;
      
      if(shouldRemoveIframeOnFinish) {
        delete outputData.iframe;
        iframe.remove();
        window.removeEventListener('message', messageHandler);
      }
      
      if(data.onFinish) {
        data.onFinish(outputData);
      }
      onFinishPromiseResolver(outputData);
    }
  }
  window.addEventListener('message', messageHandler);
  
  let iframeExistentPollInterval = setInterval(() => {
    if(!document.querySelector(`iframe.${privateIframeId}`)) {
      clearInterval(iframeExistentPollInterval);
      window.removeEventListener('message', messageHandler);
    }
  }, 1000*60); // not important to remove listener immediately, so long interval is fine
  
  function blobToDataUrl(blob) {
    return new Promise(r => {
      const reader = new FileReader();
      reader.onload = () => r(reader.result);
      reader.readAsDataURL(blob);
    });
  }
  
  let referenceImage = null;
  if(data.referenceImage) {
    referenceImage = {};
    // url can actually be a blob or a blob URL, in which case we postMessage the data to the iframe
    let isBlobby = data.referenceImage.url instanceof Blob; // blobby means Blob or blob URL string
    let url, blobby;
    
    if(isBlobby) blobby = data.referenceImage.url;
    else url = data.referenceImage.url.evaluateItem;
    
    if(url.startsWith("blob:")) {
      isBlobby = true;
      blobby = url;
      url = null;
    }
    
    if(isBlobby) {
      referenceImage.url = "<data-via-postmessage>";
      (async () => {
        let blob;
        if(typeof blobby === "string" && blobby.startsWith("blob:")) {
          blob = await fetch(blobby).then(r => r.blob());
        } else {
          blob = blobby;
        }
        let dataUrl = await blobToDataUrl(blob);
        window.addEventListener('message', function(event) {
          if(event.data.type === 'readyForData' && event.data.id === privateIframeId) {
            document.querySelector(`iframe.${privateIframeId}`).contentWindow.postMessage({id:privateIframeId, referenceImageDataUrl:dataUrl}, serverOrigin);
          }
        });
      })();
    } else {
      referenceImage.url = url;
    }
    referenceImage.blur = data.referenceImage.blur.evaluateItem;
    // if(referenceImage.url && !referenceImage.url.startsWith("https://user-uploads.perchance.") && !referenceImage.url.startsWith("data:")) return `referenceImage.url must either be a 'data URL' (starting with 'data:') or a https://user-uploads.perchance.org URL - i.e. an image that has been uploaded to https://perchance.org/upload - the URL you've used is: '${referenceImage.url && typeof referenceImage.url === "string" && referenceImage.url.length > 30 ? referenceImage.url.slice(0, 30)+"..." : referenceImage.url}'.`;
    if(referenceImage.blur > 1 || referenceImage.blur < 0) return `referenceImage.blur must be between 0 and 1, but is instead '${referenceImage.blur > 1}'.`
  }
  
  window.addEventListener('message', function(event) {
    if(event.data.type === 'readyForData' && event.data.id === privateIframeId) {
      let iframe = document.querySelector(`iframe.${privateIframeId}`);
      if(iframe) iframe.contentWindow.postMessage({type:"originNotify", frameId:privateIframeId}, serverOrigin);
    }
  });
  
  let urlHashData = {
    saveChannel: window.generatorName,
    saveTitle: d.saveTitle,
    saveDescription: d.saveDescription,
    prompt: d.prompt,
    seed: d.seed,
    resolution: d.resolution,
    guidanceScale: d.guidanceScale,
    defaultGuidanceScale,
    negativePrompt: d.negativePrompt,
    requestId: requestId,
    forceColorScheme: data.forceColorScheme,
    verifyOnly: data.verifyOnly,
    iframeId: privateIframeId,
    hideGalleryButtons: data.hideGalleryButtons,
    removeBackground: data.removeBackground,
    referenceImage,
  };
  
  // clone input for onFinish data:
  evaluatedInputs = JSON.parse(JSON.stringify(d));
  
  let iframeId = data.id ? data.id.evaluateItem : "";
  if(iframeId) {
    setTimeout(() => {
      document.querySelector("#"+iframeId).reload = function() {
        let src = this.src;
        this.src = "";
        setTimeout(() =>this.src=src, 700);
      };
    }, 500);
  }
  
  window.lastTextToImagePrompt = d.prompt;
  if(data.prompt) { // <-- i.e. if they passed a promptOptions object
    data.lastUsedPrompt = d.prompt;
    data.lastUsedNegativePrompt = d.negativePrompt;
  }
  
  // VERY lazily load the iframe (only when screen actually intersects) because some people add a lot of images in subsections and in several different tabs of tabs-plugin, etc.
  // This ensures they don't spam the server, and the visible ones get generated first.
  setTimeout(async () => {
    // the dev may have generated the HTML, but not actually added it to the DOM for a while, so we wait up to 5 mins for it
    let waitedSeconds = 0;
    while([...document.querySelectorAll(".text-to-image-plugin-image-iframe")].filter(el => el.dataset.alreadyAddedIntersectionObserver === "no").length === 0) {
      await new Promise(r => setTimeout(r, 500));
      waitedSeconds += 0.5;
      if(waitedSeconds > 60*5) return;
    }
    for(let el of [...document.querySelectorAll(".text-to-image-plugin-image-iframe")]) {
      if(el.dataset.alreadyAddedIntersectionObserver === "yes") continue;
      el.dataset.alreadyAddedIntersectionObserver = "yes";
      
      let observer1, observer2;
      
      let rootMarginSize = Math.min(1000, (window.innerHeight*2));
      if(window.innerWidth < 600) {
        rootMarginSize = Math.min(1500, (window.innerHeight*3)); // larger on mobile because e.g. images that might otherwise be displayed side by side are instead displayed vertically
      }
      
      function handler(entries) {
        if(entries[0].isIntersecting) {
          // console.debug("t2i iframe: Visible");
          if(!el.src) {
            el.removeAttribute("srcdoc");
            el.src = el.dataset.src;
            observer1.disconnect();
            observer2.disconnect(); 
          }
        } else {
          // console.debug("t2i iframe: NOT Visible");
        }
      }
      observer1 = new IntersectionObserver(handler, {
        root: document.documentElement, // otherwise I think it uses the top-level viewport? either way, it doesn't seem to work without specifying this.
        rootMargin: rootMarginSize+"px", // it's important that this is quite big - so that e.g. mobile users don't have to scroll down to trigger stuff. we basically want to trigger ~all visible elements anyway - just not stuff hidden within e.g. tabs plugin or whatever.
      });
      observer1.observe(el);
      // for some reason, in some situations, the above intersection observer was reporting the `root` and `el` bounding rects as 0x0x0x0. Adding a second observer using the viewport root fixes this:
      observer2 = new IntersectionObserver(handler, {
        rootMargin: rootMarginSize+"px",
      });
      observer2.observe(el);
    }
  }, 100); // CAUTION: do not remove/lower this delay. Some generators may create a large "feed" of images, and expect them to be lazy-loaded when scrolled to (e.g. AI chat feeds), so if you add the intersection observers ~synchronously, they could be triggered during the process of actually generating the feed, which would cause them to all start generating during page load.
  
  // let outputString = new String(`<iframe ${iframeId ? `id="${iframeId}"` : ""} class="text-to-image-plugin-image-iframe ${privateIframeId}" data-already-added-intersection-observer="no" data-src="${serverOrigin}/embed#${encodeURIComponent(JSON.stringify(urlHashData))}" style="border:0; background:transparent; ${widthHeightCss}; aspect-ratio:${resW}/${resH}; ${d.style}"></iframe>`);
  // // leaving these out for now in favor of 'onFinish' in prompt options
  // // outputString.dataUrl = dataUrlPromise;
  // // outputString.canvas = canvasPromise;
  // outputString.onFinishPromise = onFinishPromise;
  // outputString.iframeHtml = outputString;
  // return outputString;
  
  // we return the promise which stringifies into the iframe html, we can write [textToImage(promptOptions)] and while also being able to write `let result = await textToImage(promptOptions);`
  let outputString = `<iframe ${iframeId ? `id="${iframeId}"` : ""} class="text-to-image-plugin-image-iframe ${privateIframeId}" data-already-added-intersection-observer="no" data-src="${serverOrigin}/embed#${encodeURIComponent(JSON.stringify(urlHashData))}" style="border:0; background:transparent; ${widthHeightCss}; aspect-ratio:${resW}/${resH}; ${d.style}"></iframe>`;
  let outputStringHasBeenRead = false;
  onFinishPromise.toString = function() {
    outputStringHasBeenRead = true;
    return outputString;
  };
  // onFinishPromise.iframeHtml = outputString;
  Object.defineProperty(onFinishPromise, 'iframeHtml', {
    get: function() {
      outputStringHasBeenRead = true;
      return outputString;
    }
  });
  Object.defineProperty(onFinishPromise, 'evaluateItem', {
    get: function() {
      outputStringHasBeenRead = true;
      return outputString;
    }
  });
  onFinishPromise.onFinishPromise = onFinishPromise;
  
  // trigger the loading automatically if they haven't added the iframe to the document:
  setTimeout(() => {
    if(!outputStringHasBeenRead && !iframeId && !document.querySelector(`.${privateIframeId}`)) {
      shouldRemoveIframeOnFinish = true;
      let div = document.createElement("div");
      div.innerHTML = outputString.replace(`data-already-added-intersection-observer="no"`, "");
      let iframe = div.firstElementChild;
      iframe.style.cssText = `opacity:0; pointer-events:none; position:fixed; top:0; left:0;`;
      document.body.append(iframe);
      iframe.src = iframe.dataset.src;
    }
  }, 150); // this should be longer than 100ms for backward-compat because then it runs after the intersection observer is added, which means it wouldn't have loaded anyway, so it guards against the case where they're just a bit slow to add it to the HTML doc.
  
  return onFinishPromise;


character
  a {mech|demon|cyberpunk} {warrior|minion|samurai}

place
  soviet russia
  a small village
  a mountainous region
  an underwater cavern

season
  winter
  summer
  
prompt
  detailed painting of [character] in [place], [season]
  
```

## Perchance Right Side

```html

<div style="display:[window.generatorName === 'text-to-image-plugin' ? 'none' : 'block'];color:red; font-weight:bold; padding:3rem;">Heads up! This is a fork/remix of the <a href="/text-to-image-plugin" target="_blank">text-to-image-plugin</a>, but unfortunately it's a really bad idea to fork this plugin, since its code is 'coupled' with the server code, so if I need to change the server code, your version of this plugin will likely break. If you'd like new features, best to ask for them on the community forum so your generators don't randomly break in the future when I update the server code. Alternatively, you can create a new plugin that <u>imports the official version of this plugin</u> - i.e. basically create a "wrapper" plugin that changes/expands on the plugin's behavior</div>

<h1>🤖 Text to Image Plugin 🎨</h1>

<main>
 <p>This plugin allows you input some text and get an image out. It doesn't run on your actual device like other Perchance plugins because it requires too much computational power (and would require a 3GB download), so it runs on <a href="https://en.wikipedia.org/wiki/Server_(computing)" target="_blank">server</a> GPUs, which means it costs me money to run. For this reason, this plugin is funded with ads, so <b style="color:red;">an ad will appear on your generator <u>for non-logged-in users</u> if you import this plugin</b>. The ad will appear at the bottom of the screen <a href="https://user.uploads.dev/file/e3cdfc34728610cf6e351b72052ef0c1.jpeg" target="_blank" title="graphic design is my passion">like this</a>. The ad will go away if you remove the plugin, of course. <b></b> Please see the notes at the end of this page for more info.</p>
  
  <p>To use this plugin, you'll first need to import it by adding this line to your lists editor:</p>
<pre>
image = \{import:text-to-image-plugin\}
</pre>
  <p>And now try putting this in your lists editor:</p>
<pre>
character
  a \{mech|demon|cyberpunk\} \{warrior|minion|samurai\}

place
  soviet russia
  a small village
  a mountainous region
  an underwater cavern

season
  winter
  summer
  
prompt
  detailed painting of \[character\] in \[place\], \[season\]
  
output
  \[image(prompt)\]
</pre>
  <p>Now just write <code>\[output\]</code> in the HTML wherever you want an image to appear. Here's a live, working example of what that outputs:</p>
  <p id="outputEl1" style="text-align:center;">[$output(prompt)]</p>
  <p style="text-align:center;"><button onclick="update(outputEl1)">randomize</button></p>
  
  <p>You can hover your mouse over the image (or long-press on mobile) to see the prompt that was used, or click the info icon in the corner of the image. You can also manually display the prompt below the image by using the special <code>lastTextToImagePrompt</code> variable that this plugin creates:</p>
<pre>
output
  \[image(prompt)\] &lt;br&gt; \[lastTextToImagePrompt\]
</pre>
  <p><a href="https://perchance.org/text-to-image-plugin-example-4#edit" target="_blank">Here's an example generator</a> that uses the above code. Try playing around with the lists and saving your own copy.</p>
  <p>As the name suggests, <code>\[lastTextToImagePrompt\]</code> will always contain the most recently used prompt. If you instead wrote <code> \[image(prompt)\] … \[prompt\]</code> then the prompt used to generate the image (seen on hover) and the prompt output under the image would be different, because each time <code>prompt</code> is evaluated, it is randomized (it's just a normal Perchance list, after all).</p>
  
  <p>If you want the prompt text to be <i>above/before</i> the image, you can do that like this:</p>
<pre>
output
  \[p = prompt.evaluateItem\] &lt;br&gt; \[image(p)\]
</pre>
    <p><a href="https://perchance.org/text-to-image-plugin-example#edit" target="_blank">Here's an example generator</a> that uses the above code. And <a href="https://perchance.org/multiple-images-with-text-to-image-plugin#edit" target="_blank">this example</a> shows how to add multiple images to your generator.</p>
    <p><a href="https://perchance.org/text-to-image-with-user-input-example#edit" target="_blank">Here's an example generator</a> that has multiple images and also allows the user to input a text prompt.</p>
  
    <p>There are some options/settings that you can set two different ways - the first is by putting them in a promptData list like this:</p>
<pre>
promptData
  prompt = painting of \[character\] in \[place\], \[season\]
  seed = 123
  size = 400  <span style="opacity:0.5">// size is only a valid property for square resolutions</span>
  style = border:4px solid blue; margin-top:20px; <span style="opacity:0.5">// CSS styles</span>
</pre>
  <p>You'd then write <code>\[image(promptData)\]</code> to generate an image using those settings (and in this case you can use <code>\[promptData.lastUsedPrompt\]</code> instead of <code>\[lastTextToImagePrompt\]</code> to get the prompt that was used if you want).</p>
  <p>The second way is to put the options directly in your prompt text like this:</p>
<pre>
prompt
  \[character\] in \[place\] (size:::400) (seed:::123)
  
output
  \[image(prompt)\]
</pre>
  <p><a href="https://perchance.org/text-to-image-plugin-options-in-prompt-example#edit" target="_blank">Here's an example generator</a> that has the options/settings within the prompt text itself. The options should always be at the end of the prompt, and should follow the <code>(name:::value)</code> format.</p>
  <p>You can of course omit settings that you don't want to customize.</p>
  <p>You can choose between 3 different resolutions using the <code>resolution</code>. The valid resolution values are 512x512, 512x768 and 768x512:</p>
<pre>
promptData
  prompt = fantasy \{forest|city|village|cafe|cavern|island|plains|castle|canyon|supercity|megalopolis\}, extremely detailed oil painting, unreal 5 render, rhads, bruce pennington, studio ghibli, tim hildebrandt, digital art, octane render, beautiful composition, trending on artstation, award-winning photograph, masterpiece
  resolution = 512x768
  width = 400  <span style="opacity:0.5">// height will be auto-chosen based on aspect ratio if omitted, and vice versa for width</span>
</pre>
  <p><a href="https://perchance.org/text-to-image-plugin-example-3#edit" target="_blank">Here's an example generator</a> that uses the above code, and here's a live demo of that:</p>
  <p id="outputEl2" style="text-align:center;">[$output({prompt:"fantasy {forest|city|village|cafe|cavern|island|plains|castle|canyon|supercity|megalopolis}, extremely detailed oil painting, unreal 5 render, rhads, bruce pennington, studio ghibli, tim hildebrandt, digital art, octane render, beautiful composition, trending on artstation, award-winning photograph, masterpiece", resolution:"512x768", width:400})]</p>
  <p style="text-align:center;"><button onclick="update(outputEl2)">randomize</button></p>
  
  <p>There are a couple of other parameters to play with:</p>
  <ul>
    <li><b><code>negativePrompt</code></b>: Tell the AI what you <u>don't</u> want in the image. E.g. if you don't want any blurriness in the output image, you'd write something like <code>negativePrompt = blur, blurry image, motion blur</code>. Here's <a href="https://perchance.org/negative-prompt-example-text-to-image-plugin#edit" target="_blank">an example generator</a> showing this feature.</li>
    <li><b><code>guidanceScale</code></b>: Roughly speaking, this controls how much the output image "matches" the prompt. You can make the value higher to make the output "match" the prompt more, at the expense of realism. The default value is 7, the minimum is 1, and the maximum is 30.</li>
  </ul>
  
  <p>You'll notice that when you hover your mouse over the image there's a button which opens a menu that allows you to save images to a public gallery (for your generator), and to display said gallery. You can set the title and description that a gallery image will be saved with like this:</p>
<pre>
promptData
  prompt = ...
  saveTitle = ...
  saveDescription = ...
</pre>
  <p>If you don't set a <code>saveTitle</code> and <code>saveDescription</code>, then by default the title will be the part of the prompt that comes before the first full-stop/comma/question-mark/exclamation-mark, and the description will be the whole prompt.</p>
  
  <p>After an image has finished generating, if you mouseover it, you'll notice some buttons. One of the buttons opens a menu which shows a button to download the image, and to save to a gallery, or to open the gallery. You can hide the gallery buttons like this:</p>
<pre>
promptData
  prompt = ...
  hideGalleryButtons = true
</pre>

  <h2 style="margin-top:3rem;">Gallery Options</h2>
  <p>If you'd like to display the gallery on your page, rather than users having to click the button to open it, you can use "special" options list with the <code>gallery</code> property like this:</p>
<pre>
galleryOptions
  gallery = true
  sort = top <span style="opacity:0.5">// or 'recent' or 'trending'</span>
  timeRange = 1-week
  hideIfScoreIsBelow = -2 <span style="opacity:0.5">// images will be removed if they get down-voted to a score below -2</span>
  adaptiveHeight = true <span style="opacity:0.5">// expand height to fit all images (so there's no scrollbar on the gallery)</span>
  style = ... <span style="opacity:0.5">// optional CSS styles (you can delete this line)</span>
  customButton = ... <span style="opacity:0.5">// see below for details</span>
  customButton2 = ... <span style="opacity:0.5">// see below for details</span>
  defaultGalleryNames = characters,memes,chat <span style="opacity:0.5">// clickable gallery names displayed by default</span>
</pre>
  <p>And then just put this in your HTML editor (bottom-right editor):</p>
<pre>
\[image(galleryOptions)\]
</pre>
  <p>The valid values for <code>timeRange</code> are: <code>1-day</code>, <code>3-day</code>, <code>1-week</code>, <code>1-month</code>, <code>1-year</code>, <code>all-time</code>. <a href="https://perchance.org/text-to-image-plugin-gallery-example#edit" target="_blank">Here's an example generator</a> that displays the gallery.</p>
  
  <h2 style="margin-top:3rem;">Gallery Moderation</h2>
  <p>You can ban users and prompt phrases from the gallery using the <b>bannedUsers</b>, <b>bannedPromptPhrases</b>, and <b>bannedNegativePromptPhrases</b> options. Have a look at <a href="https://perchance.org/text-to-image-gallery-moderation-example#edit" target="_blank">this example</a> to see these features in action.</p>
<pre>
galleryOptions
  gallery = true
  <span style="opacity:0.5">// ...</span>
  bannedUsers <span style="opacity:0.5">// click the settings button at the top of the gallery and type "admin" to toggle admin mode on, then double-click on an image to get the user ID of the creator.</span>
    263efb15c47c2d2f398e91bf169f50d4a0ca69251638c9d0eb5823c0e4fba538
    f50d4a0ca69251638c9d0eb5823c0e4fba538263efb15c47c2d2f398e91bf169
  bannedPromptPhrases
    pg13:blood <span style="opacity:0.5">// ban the word 'blood' in pg13 mode</span>
    /twin.?towers?/ <span style="opacity:0.5">// example of 'regex'-based pattern matching to ban 'twin towers' or 'twin-tower' or 'twin_towers', and so on</span>
    pg13:/\b(gore|blood)\b/i <span style="opacity:0.5">// another example of 'regex'-based pattern matching - uses word boundaries and case-insensitive matching</span>
  bannedNegativePromptPhrases
    pg13:wearing clothes <span style="opacity:0.5">// ban the word 'wearing clothes' in the *negative* prompt when in pg13 mode</span>
</pre>
  <p>You can click the settings button at the top of the gallery and type "admin" to toggle on "admin mode". This will show images that contain banned phrases with a red border instead of hiding them (useful for debugging regexes and ensuring that your ban lists aren't banning harmless prompts), and you can double-click on any image to get the user ID of the creator. Again, look at <a href="https://perchance.org/text-to-image-gallery-moderation-example#edit" target="_blank">this example</a>, for an example of these moderation features.</p>

  <h2 style="margin-top:3rem;">Custom Buttons in Gallery</h2>
  <p>You can add a custom button to each gallery image, and when the user clicks it, you can run some code based on that:</p>
<pre>
galleryOptions
  gallery = true
  customButton
    emoji = ⭐
    onClick(data) =>
      <span style="opacity:0.5">// This code runs when the user clicks on the custom button.</span>
      <span style="opacity:0.5">// The 'data' variable includes information about the image they clicked your custom button on: data.imageId, data.imageUrl, data.userId, data.isNsfw, data.prompt, data.negativePrompt, data.guidanceScale, data.seed, data.galleryName</span>
      console.log(data);
</pre>
  <p><a href="https://perchance.org/text-to-image-gallery-custom-button-example#edit" target="_blank">Here's an example</a> of a custom button that shows a fullscreen version of the image when the custom button is clicked.</p>
  <p>You can create two different custom buttons: <code>customButton</code> and <code>customButton2</code>. <a href="https://perchance.org/text-to-image-gallery-custom-button2-example#edit" target="_blank">See this page</a> for an example that uses <code>customButton2</code> to add a comments box for each image in the gallery. If you need more buttons, then you could make one of the buttons show a popup menu which contains a list of actions the user can take for that image.</p>
  
  <h2 style="margin-top:3rem;">Advanced Usage</h2>
  <p>If you know JavaScript, then here's some code demonstrating how to use this plugin in your functions:</p>
<pre>
async start() =>
  let result = await image(\{prompt:"a cute mouse"\});
  document.body.append(result.canvas);
  imageEl.src = result.dataUrl;
  console.log("prompt used:", result.inputs.prompt);
  console.log("all inputs used:", result.inputs);
</pre>
  <p><a href="https://perchance.org/text-to-image-plugin-programmatic-example#edit" target="_blank">Here's an example</a> of the above code. Also check <a href="https://perchance.org/text-to-image-canvas-simple-example#edit" target="_blank">this example</a>.</p>
  <p>Also, here's a <b>simplified</b> version of the above example:</p>
<pre>
async start() =>
  imageEl.src = await image("a cute mouse");
</pre>
  <p>And here's an example showing how you can put options in the second argument if the first one is a string, and this also shows the <code>removeBackground</code> option:</p>
<pre>
imageEl.src = await image("a cute mouse", \{resolution: "512x768", removeBackground:true\});
</pre>
  <p>This works because if we pass plain text into the plugin, it interprets it as the <code>prompt</code>. Also, the resulting 'object' returned by the plugin is always a <code>String</code> object with some extra properties added (i.e. <code>canvas</code>, <code>dataUrl</code>, <code>iframe</code>), so you can write <code>imageEl.src=result</code> instead of <code>imageEl.src=result.dataUrl</code>. They're the same.</p>
  <p>Also, the iframe has a property <code>iframe.textToImagePluginOutput</code> which is added after the generation is finished, and you can use that to access the image either as a HTML5 canvas or as a Data URL:</p>
<pre>
iframe.textToImagePluginOutput.canvas
iframe.textToImagePluginOutput.dataUrl
iframe.textToImagePluginOutput.inputs.prompt
iframe.textToImagePluginOutput.inputs.negativePrompt
iframe.textToImagePluginOutput.inputs.seed
...
</pre>
 <p><b>Notes:</b></p>
 <ul>
  <li>You can use <a href="https://perchance.org/text-to-image-plugin-example#edit" target="_blank">this example</a> to get started. And <a href="https://perchance.org/text-to-image-plugin-example-2#edit" target="_blank">here's another</a> that hides the irrelevant parts of the prompt from the user.</li>
  <li>Images are <b>not</b> stored on the server unless the user explicitely saves them to the gallery - see <a href="https://lemmy.world/comment/5709061" target="_blank">this post</a> for more info.</li>
  <li>If you want to programmatically get the actual image data that is generated - so e.g. you can draw some text on it, or make it greyscale, or collage multiple images together, or whatever, check out <a href="https://perchance.org/text-to-image-canvas-simple-example#edit" target="_blank">this example</a>.</li>
  <li>The quality of the output image can change <b>dramatically</b> depending on the wording in your prompt. You can use a generator <a href="https://perchance.org/ai-text-to-image-generator" target="_blank">like this</a> to play around with your prompt design (click the info icon on the output images to see the full prompt used).</li>
    <li>You can call the <code>promptData</code> list whatever you want. If your settings list was called <code>promptSettings</code> then you'd write <code>\[image(promptSettings)\]</code> to generate the output image. You can have many prompt-settings lists in one generator.</li>
    <li>The <code>seed</code> parameter should be any number like 3834329 or 9278236492. A <code>seed</code> of -1 is default and means "choose a random seed for me". If you provide the same seed with the same prompt, it should generate a very similar picture (ideally the same, but not always exact due to GPU hardware technicalities). But <b>note</b>: I'll be upgrading the machine learning models that power this as new ones are released, and during the upgrades, the image that a seed+prompt combination "refers to" will change.</li>
    <li>If a seed of -1 is used (which again, is default), then an icon will appear (when you hover over the image) to allow you to try generating it again to get a different result. If you want to add your own "try again" button that just regenerates the image and nothing else, then add <code>id=yourImageId</code> to your <code>promptData</code> list and then use this code to create your "try again" button: <code>&lt;button onclick="yourImageId.reload()"&gt;try again&lt;/button&gt;</code>. <a href="https://perchance.org/text-to-image-custom-reload-button-example#edit" target="_blank">Here's an example generator</a> that does that.</li>
    <li>The model <b>can return NSFW/adult-themed results</b> if prompted with NSFW/adult-themed terms. <b>Treat this like a Google image search</b>, and prompt responsibly. You can add terms like "NSFW" and "nudity" to the <code>negativePrompt</code> option as a way to reduce the probability that you'll get accidental NSFW results. May also want to add "fully clothed" to the <code>prompt</code> in some cases.</li>
    <li>Each user can only have a few concurrent server requests, so if you have lots of images on one page, they'll queue up.</li>
    <li>The 19th day of every month is observed as 'Ad-viewer Appreciation Day' in the Perchance community. On this day we pay our respects to the non-logged-in users who fund the GPU servers by viewing ads on generators that import AI-based plugins. Logged-in users are encouraged to spare a moment for these anonymous benefactors, wishing for them a month of relevant and interesting ads, and thanking them for their tolerance of increased browser tab memory usage, and their indirect but valuable contribution to the Perchance community via the digital attention economy. May their mobile game ads not be too sus, and may the gameplay reflect the real gameplay even if only abstractly 🕯️</li>
  <li>Check out more plugins at <a href="/plugins">perchance.org/plugins</a></li>
 </ul>
  <p>As some inspiration, here are some images produced using the prompt "<i>fantasy \[thing\], extremely detailed oil painting, unreal 5 render, rhads, bruce pennington, studio ghibli, tim hildebrandt, digital art, octane render, beautiful composition, trending on artstation, award-winning photograph, masterpiece</i>":</p>
  <img src="https://i.imgur.com/YNcf0Hj.jpg" style="max-width:100%;"/>
</main>
<p style="text-align:center; font-size:200%; opacity:0.2; margin-top:0.5em;"><span>⚄&#xFE0E;</span></p>
<br><br><br>

<style>
  html { color-scheme: dark light }
  main {
    text-align:left;
  max-width:900px;
  margin:0 auto;
  background: #fff;
  background: light-dark(#fff, #101010);
  padding:1em;
  border-radius:3px;
  box-shadow: 0 0.5px 0 0 #ffffff inset, 0 1px 2px 0 #B3B3B3;
  box-shadow: 0 0.5px 0 0 light-dark(#fff, #060606) inset, 0 1px 2px 0 light-dark(#B3B3B3, #2c2c2c);
 }
  ul li {
  margin-top:0.5em; 
 }
 p {
    line-height: 1.4em;
  }
  main p:first-child {
    margin-top:0;
  }
 body {
  background-color:#f6f6f6; 
  background-color: light-dark(#f6f6f6, #000);
    color: black;
    color: light-dark(black, #d6d6d6);
 }
 pre {
  text-align:left;
  background: #333;
    background: light-dark(#333, #212121);
    color: #e2e2e2;
    padding: 1em;
    border-radius: 2px;
  tab-size: 2;
  -moz-tab-size: 2;
  -o-tab-size: 2;
  -webkit-tab-size: 2;
 }
 code {
  background: #eff0f1;
    background:  light-dark(#eff0f1, #272727);
    padding: 1px 5px; 
  white-space: nowrap;
 }
</style>

```
