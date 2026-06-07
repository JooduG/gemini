# <https://perchance.org/ai-text-plugin>

## Perchance Left Side

```perchance
$output(inputData, extraOpts) =>

  const serverOrigin = "https://text-generation.perchance.org";
  
  let iframe;  
  if(!window.__alreadyAddedAiTextPluginStuff8492739) {
    iframe = document.createElement("iframe"); 
    iframe.src = `${serverOrigin}/embed`;
    iframe.style.cssText = "display:none; position:fixed; top:0.5rem; right:0.5rem; height:3rem; width:11rem; background:#333; border:none; border-radius:3px; box-shadow:0px 2px 4px 0px #00000066; z-index:10000";
    iframe.id = "aiTextPluginEmbedIframe";
    
    setTimeout(() => {
      if(!window.__aiTextIframeEmbedIsReady) {
        iframe.src = `${serverOrigin}/embed?__cacheBust=${Math.random()}`;
      }
    }, 15*1000);
    
    const style = document.createElement("style");
    style.textContent = `
      @keyframes ai-text-plugin-blink { 50% { fill: transparent }} .ai-text-plugin-dot { animation: 1s ai-text-plugin-blink infinite; fill: grey; } .ai-text-plugin-dot:nth-child(2) { animation-delay: 250ms } .ai-text-plugin-dot:nth-child(3) { animation-delay: 500ms } .ai-text-plugin-loader { background-color: #f1f1f1; color: grey; }
      
      .ai-text-response-end-buttons-ctn:before {
        content: "+";
      }
      .ai-text-response-end-buttons-ctn {
        position:relative;
      }
      .ai-text-response-buttons-wrapper {
        display:none;
        position:absolute;
        width: max-content;
        bottom: 0;
        min-height: 2.5rem;
        pointer-events:none;
      }
      @media screen and (max-width: 600px) {
        .ai-text-response-buttons-wrapper {
          min-height: 3.5rem; /* buttons should be further apart on mobile - else 'hover' click triggers the buttons themselves */
        }
      }
      
      .ai-text-response-end-buttons-ctn:hover .ai-text-response-buttons-wrapper {
        display:flex;
        pointer-events:auto;
      }
    `;
    document.head.appendChild(style);
    
    window.addEventListener('message', (event) => {
      if(event.source !== iframe.contentWindow) return;
      if(event.origin !== serverOrigin) return;

      if(event.data.type === "embedIsReady") {   
        window.__aiTextIframeEmbedIsReady = true;
        // console.debug("got embedIsReady, sent verifyUser");
        if(!window.__alreadyTriggeredAiTextPluginPreload8492739) {
          iframe.contentWindow.postMessage({type:"verifyUser"}, serverOrigin);
        }
      }
      if(event.data.type === "verified") {
        iframe.style.display = "none";
      }
      if(event.data.type === "verifying") {
        iframe.style.display = "";
      }
    });
    document.body.appendChild(iframe);
    
    window.__alreadyAddedAiTextPluginStuff8492739 = true;
  } else {
    iframe = document.querySelector("#aiTextPluginEmbedIframe");
  }
  
  if(inputData && inputData.preload === true) {
    if(!window.__alreadyTriggeredAiTextPluginPreload8492739) {
      (async function() {
        while(!window.__aiTextIframeEmbedIsReady) await new Promise(r => setTimeout(r, 500));
        await new Promise(r => setTimeout(r, 500));
        iframe.contentWindow.postMessage({type:"preload"}, serverOrigin);
      })();
      window.__alreadyTriggeredAiTextPluginPreload8492739 = true;
    }
    return "";
  }
  
  if(inputData && inputData.getMetaObject===true) {

    // Fast bigram-based approx token counter thingy.
    // About 80x faster and 200x smaller than HF tokenizer.
    // To "train" a new fast/approx counter like this (but e.g. on a non-deepseek tokenizer), use this script:
    //    deno run --allow-write=. --allow-net https://user.uploads.dev/file/e29eab687b1fbf129076ec6057484bb3.js --tokenizer=/abs/path/to/tokenizer.json
    const MODEL_BASE64="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",MAGIC=[68,66,71,49],VERSION=1,EMPTY_KEY=4294967295;function decodeVarUint(A,B){let Q=0,E=0;for(;;){const g=A[B.value++];if(E|=(127&g)<<Q,0==(128&g))return E>>>0;Q+=7}}function nextPow2(A){let B=1;for(;B<A;)B<<=1;return B}function keyHash(A){let B=A>>>0;return B^=B>>>16,B=Math.imul(B,2146121005),B^=B>>>15,B=Math.imul(B,2221713035),B^=B>>>16,B>>>0}function base64ToBytes(A){const B=atob(A),Q=new Uint8Array(B.length);for(let A=0;A<B.length;A+=1)Q[A]=B.charCodeAt(A);return Q}function parseModelBytes(A){const B=new DataView(A.buffer,A.byteOffset,A.byteLength);let Q=0;for(const A of MAGIC)if(B.getUint8(Q++)!==A)throw new Error("Invalid model header.");const E=B.getUint16(Q,!0);if(Q+=2,Q+=2,1!==E)throw new Error(`Unsupported model version: ${E}`);const g=B.getFloat32(Q,!0);Q+=4;const w=B.getFloat32(Q,!0);Q+=4;const C=B.getFloat32(Q,!0);Q+=4;const D=B.getUint32(Q,!0);Q+=4;const I=B.getUint32(Q,!0);Q+=4;const M=new Int16Array(A.buffer,A.byteOffset+Q,256);Q+=M.byteLength;const P=A.subarray(Q,Q+I);Q+=I;const f=new Int16Array(A.buffer,A.byteOffset+Q,D),e=new Uint32Array(D);let v=0;const H={value:0};for(let A=0;A<D;A+=1)v+=decodeVarUint(P,H),e[A]=v>>>0;const c=nextPow2(Math.max(8,2*D)),o=new Uint32Array(c),t=new Int16Array(c);o.fill(EMPTY_KEY);for(let A=0;A<D;A+=1){const B=e[A];let Q=keyHash(B)&c-1;for(;o[Q]!==EMPTY_KEY;)Q=Q+1&c-1;o[Q]=B,t[Q]=f[A]}return{bias:g,unigramScale:w,bigramScale:C,unigramWeights:M,tableKeys:o,tableWeights:t}}const model=parseModelBytes(base64ToBytes(MODEL_BASE64)),encoder=new TextEncoder,mask=model.tableKeys.length-1;function lookupPairWeight(A){let B=keyHash(A)&mask;for(;;){const Q=model.tableKeys[B];if(Q===EMPTY_KEY)return 0;if(Q===A)return model.tableWeights[B]/model.bigramScale;B=B+1&mask}}
    function countTokensApprox(A){const B=encoder.encode(A);let Q=model.bias,E=256;for(let A=0;A<B.length;A+=1){const g=B[A];Q+=model.unigramWeights[g]/model.unigramScale,Q+=lookupPairWeight(257*E+g),E=g}return Q+=lookupPairWeight(257*E+256),Q};
    
    return {
      countTokens: function(text) {
        return Math.ceil(countTokensApprox(text));
        // return Math.ceil(text.length/3.6); // old, very bad approximation
      },
      idealMaxContextTokens: 6000, // this is just a recommendation - not a fundamental limit. and it will increase over time.
    };
  }
  // console.debug("inputData:", inputData);
  if(!inputData) return "(Error: No input data given to the ai text plugin.)";
  if(inputData.instructions) {
    if(inputData.outputTo) {
      inputData.outputTo.value = "(Error: Looks like you wrote 'instructions = ...' instead of 'instruction = ...' in your ai-text-plugin prompt data?)";
    } else {
      return "(Error: Looks like you wrote 'instructions = ...' instead of 'instruction = ...' in your ai-text-plugin prompt data?)";
    }
  }
  
  if(typeof inputData === "string" || inputData instanceof String) {
    inputData = {instruction:inputData+""}
    if(!extraOpts) extraOpts = {};
    if(extraOpts.startWith) inputData.startWith = extraOpts.startWith;
    if(extraOpts.stopSequences) inputData.stopSequences = extraOpts.stopSequences;
    if(extraOpts.hideStartWith) inputData.hideStartWith = extraOpts.hideStartWith;
    if(extraOpts.outputTo) inputData.outputTo = extraOpts.outputTo;
    if(extraOpts.outputTo) inputData.outputTo = extraOpts.outputTo;
    if(extraOpts.onChunk) inputData.onChunk = extraOpts.onChunk;
    if(extraOpts.onStart) inputData.onStart = extraOpts.onStart;
    if(extraOpts.onFinish) inputData.onFinish = extraOpts.onFinish;
    if(extraOpts.render) inputData.render = extraOpts.render;
    if(extraOpts.endButtons) inputData.endButtons = extraOpts.endButtons;
  }
  
  // REMEMBER: if you add more inputs, you need to also update `window.__continueAiTextResponseClickHandler`
  let hideStartWith = inputData.hideStartWith; // get the 'concrete' value in case it was dynamic like `hideStartWith = [ ... ]` - this is important because the condition in the square brackets could change later
  
  let instruction = inputData.instruction;
  if(typeof instruction === "function") {
    instruction = instruction({}); // this is useful as a way to give a string that should not be evaluated - since e.g. instruction = [textareaEl.value] will actually evaluate the text when we call inputData.instruction
    if(typeof instruction !== "string") instruction = instruction.toString();
  } else if(instruction) {
    if(typeof instruction !== "string") {
      instruction = instruction.evaluateItem;
    }
    instruction = instruction.toString();
  } else {
    instruction = "Write something."; // default instruction
  }
  
  let startWith = inputData.startWith;
  if(typeof startWith === "function") {
    startWith = startWith({}); // this is useful as a way to give a string that should not be evaluated - since e.g. startWith = [textareaEl.value] will actually evaluate the text when we call inputData.startWith
    if(typeof startWith !== "string") startWith = startWith.toString();
  } else if(startWith) {
    if(typeof startWith !== "string") {
      startWith = startWith.evaluateItem;
    }
    startWith = startWith.toString();
    // We trim whitespace off the end due to the classic tokenizer problem (most word tokens start with a space as of 2023 tokenizers).
    // This of course does mean that you can't "force" the model to start with a space after a word, but it's worth that trade-off until we get models with better tokenizers.
    startWith = startWith.replace(/ +$/g, ""); // CAUTION: Don't trim newlines - only spaces. Because e.g. the story writer demo relies on being able to start with 2 new lines before the paragraph that the AI is about to generate, since if the AI generates them, it'll trigger the stop sequence before it even gets to start writing the new paragraph
  } else {
    startWith = "";
  }

  let stopSequences = inputData.stopSequences;
  if(typeof stopSequences === "function") {
    stopSequences = stopSequences({});
  } else if(stopSequences) {
    if(!Array.isArray(stopSequences)) {
      stopSequences = stopSequences.selectAll.map(n => n.evaluateItem);
    }
  } else {
    stopSequences = [];
  }
  
  let textareaLoadingIndicatorHandler;
  
  // REMEMBER: if you add more inputs, you need to also update `window.__continueAiTextResponseClickHandler`
  
  let concreteInputs = {startWith, instruction, stopSequences};  // <-- CAUTION: the startWith property of this is set to the full startWith+generatedText after generation, and the startWith can be changed after generation for the `editAiTextResponseClickHandler` feature - ctrl+f for `concreteInputs.startWith =`. Use `originalConcreteInputs` for original inputs.
  const originalConcreteInputs = Object.freeze(JSON.parse(JSON.stringify(concreteInputs)));

  let placeholderEl;
  let placeholderElDidInitiallyExist = false; // this is for keepalive stuff - so we can cancel a queued up generation if the placeholder is removed
  let userStoppedGeneration = false;
  
  let textStreamController;
  const textStream = new ReadableStream({
    start(c) {
      textStreamController = c;
    }
  });
  
  let darkModeEnabled = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const animatedLoadingSvg = `<svg style="${darkModeEnabled ? "filter:invert(0.85);" : ""} height:1rem; width:2rem; overflow:hidden; border-radius:3px; vertical-align:top; position:relative; top:0.07rem; margin-left:0.125rem;" height="1rem" width="2rem" class="ai-text-plugin-loader"> <circle class="ai-text-plugin-dot" cx="0.5em" cy="0.5em" r="0.2em" style="fill:grey;"></circle> <circle class="ai-text-plugin-dot" cx="1em" cy="0.5em" r="0.2em" style="fill:grey;"></circle> <circle class="ai-text-plugin-dot" cx="1.5em" cy="0.5em" r="0.2em" style="fill:grey;"></circle> </svg>`;
  
  let generatedText = "";
  let finishedGenerating = false;
  let thereWasAnErrorDuringGeneration = false;
  
  let onFinishPromiseResolver;
  let onFinishPromiseRejecter;
  let onFinishPromise = new Promise((resolve, reject) => {
    onFinishPromiseResolver = resolve;
    onFinishPromiseRejecter = reject;
  });
  
  let completionId = "aiTextCompletion"+Math.random().toString().replace(".", "");
  let lastGeneratedChunkReceivedTime = null;

  async function streamTextFromIframe(chunkCallback) { 
    let postData = {};
    postData.instruction = concreteInputs.instruction || "";
    postData.startWith = concreteInputs.startWith || "";
    postData.stopSequences = concreteInputs.stopSequences || [];
    postData.generatorName = window.generatorName;

    postData.instruction = postData.instruction.replace(" ", " ");
    if(!postData.instruction.includes(" ")) { postData.instruction = `${postData.instruction} `; } 
    
    let url = `${serverOrigin}/api/generate`;
    let haveReceivedFirstTextChunk = false;
    let haveReceivedLastTextChunk = false;
    function messageHandler(event) {
      if(event.data.requestId !== completionId) return;
      
      // console.debug("streamTextFromIframe messageHandler:", event.data);
      if(event.data.type === "streamData") {
        lastGeneratedChunkReceivedTime = Date.now();
        let text = event.data.value.text;
        let data = {text};
        if(event.data.value.stopReason) data.stopReason = event.data.value.stopReason;
        
        // console.debug("event.data.value:", event.data.value);
        if(!haveReceivedFirstTextChunk) {
          data.isFirstChunk = true;
          haveReceivedFirstTextChunk = true;
        }
        if(haveReceivedLastTextChunk) {
          console.error("haveReceivedLastTextChunk but about to send another chunk??? maybe recieving streamEnd before it's actually finished??");
        }
        if(event.data.value.final) {
          data.isLastChunk = true; // remember, a chunk can be both the first *and* last chunk
          haveReceivedLastTextChunk = true;
        }
        chunkCallback(data);
      } else if (event.data.type === "streamEnd") {
        // console.debug(`ai-text-plugin Received 'streamEnd' for ${completionId}`);
        window.removeEventListener("message", messageHandler);
        if(!haveReceivedLastTextChunk) {
          // this can happen if stream is aborted, or if .stop() was called in userland, and perhaps for other reasons, so we send a last "dummy" chunk
          chunkCallback({text:"", stopReason:"user", isLastChunk:true, isFirstChunk:!haveReceivedFirstTextChunk});
          haveReceivedLastTextChunk = true;
        }
      } else if (event.data.type === "streamError") {
        if(userStoppedGeneration && event.data.status === "stale") {
          // this is not actually an error, but iframe embed can't know that, so it sends us this, which we just ignore.
        } else {
          if(!finishedGenerating) { // <-- just to guard against weird timing stuff
            thereWasAnErrorDuringGeneration = true;
            chunkCallback({text:"", error:true, isLastChunk:!haveReceivedLastTextChunk, isFirstChunk:!haveReceivedFirstTextChunk});
            let div = document.createElement("div");
            div.innerHTML = `<div style="z-index:1000; position: fixed; bottom: 1rem; width: 100%; pointer-events:none;"><span style=" padding: 0.5rem; background: #ac2c2c; border-radius: 3px; color: white; pointer-events:auto;">error: ${event.data.status.replaceAll("_", " ")}</span></div>`;
            div = div.firstElementChild;
            document.body.appendChild(div);
            setTimeout(() => {
              div.remove();
            }, 1000*5);
          }
        }
        window.removeEventListener("message", messageHandler);
      }
    }
    
    window.addEventListener("message", messageHandler);
    
    while(!window.__aiTextIframeEmbedIsReady) {
      await new Promise(r => setTimeout(r, 100));
    }
    if(inputData._debug) postData._debug = JSON.parse(JSON.stringify(inputData._debug));
    iframe.contentWindow.postMessage({ type: "startStream", url, postData, requestId:completionId, perchanceGeneratorOrigin:window.location.origin }, serverOrigin);
    // console.debug("sent startStream request to iframe");
  }

  async function editAiTextResponseClickHandler(el) {    
    let saveButton = document.createElement("button");
    saveButton.style.cssText = "position:fixed; z-index:501;";
    saveButton.textContent = "💾";
    document.body.append(saveButton);

    let textarea = document.createElement("textarea");
    textarea.style.cssText = "z-index:500; display:block; position:fixed; min-height:2rem; min-width:10rem;";
    textarea.value = concreteInputs.startWith;
    document.body.append(textarea);
    let updateCoverPosition = () => {
      let rect = el.getBoundingClientRect();
      textarea.style.left = `${rect.left}px`;
      textarea.style.top = `${rect.top}px`;
      textarea.style.width = `${rect.width}px`;
      textarea.style.height = `${rect.height+10}px`;

      let textareaRect = textarea.getBoundingClientRect(); // Use coverElement's dimensions
      saveButton.style.left = `${textareaRect.right-saveButton.offsetWidth}px`;
      saveButton.style.top = `${textareaRect.bottom}px`;
    };
    updateCoverPosition();
    window.addEventListener('scroll', updateCoverPosition);
    window.addEventListener('resize', updateCoverPosition);
    
    const observer = new MutationObserver((mutationsList) => {
      for(let mutation of mutationsList) {
        for(let node of mutation.removedNodes) {
          if(node.contains(el)) {
            textarea.remove();
            saveButton.remove();
            window.removeEventListener('scroll', updateCoverPosition);
            window.removeEventListener('resize', updateCoverPosition);
            observer.disconnect();
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    await new Promise(r => saveButton.onclick=r); 

    let endButtonsCtn = el.querySelector(".ai-text-response-end-buttons-ctn");
    endButtonsCtn.remove();

    concreteInputs.startWith = textarea.value;
    
    // we do this because the onFinishPromise is actually the return value of this function, but it also serves as an object with a bunch of handy properties like .liveResponseText, .stop(), etc.
    onFinishPromise.liveResponseText = textarea.value;
    
    // el.innerHTML = textarea.value;
    // el.appendChild(endButtonsCtn);
    renderResponseTextIntoContainer(textarea.value, {addEndButtons:true, isFinalRender:true});

    window.removeEventListener('scroll', updateCoverPosition);
    window.removeEventListener('resize', updateCoverPosition);
    textarea.remove();
    saveButton.remove();
  };
  
  async function continueAiTextResponseClickHandler(el, opts={}) {    
    let instruction = concreteInputs.instruction;
    let startWith = concreteInputs.startWith;
    let stopSequences = concreteInputs.stopSequences;
    
    if(opts.appendContinuationSuffix) startWith += "\n";
    
    responseEndButtonsCtn.remove();
    let obj = $output({instruction, startWith, stopSequences, style:inputData.style, outputTo:el, render:inputData.render, onFinish:inputData.onFinish, onChunk:inputData.onChunk});
    el.innerHTML += obj.loadingIndicatorHtml;
    let result = await obj;
    if(!opts.appendContinuationSuffix && result.generatedText === "" && !result.text.endsWith("\n\n")) {
      // no text was generated, so try again with a suffix that's likely to trigger more text.
      // TODO: maybe check stopReason here too?
      continueAiTextResponseClickHandler(el, {appendContinuationSuffix:true})
    }
  };
  
  let responseEndButtonsCtn;
  {
    let buttonGap = "0.25rem";
    if(window.innerWidth < 600) buttonGap = "1.5rem";
    
    let darkModeEnabled = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    let responseEndButtonsHtml = `<span class="ai-text-response-end-buttons-ctn" style="display: inline-flex;background:${darkModeEnabled ? "#666666" : "#f1f1f1"};color: ${darkModeEnabled ? "#d5d5d5" : "grey"};height: 1rem;width: 1rem;border-radius: 3px;vertical-align: top;position: relative;top: 0.07rem;margin-left: 0.125rem;align-items: center;justify-content: center;cursor: pointer; font-size:80%">
      <div class="ai-text-response-buttons-wrapper">
        <button class="ai-text-continue-button" style="height:min-content;">▶️</button>
        <button class="ai-text-edit-button" style="height:min-content; margin-left:${buttonGap}">✏️</button>
      </div>
    </span>`;
    responseEndButtonsCtn = document.createElement("div");
    responseEndButtonsCtn.innerHTML = responseEndButtonsHtml;
    responseEndButtonsCtn = responseEndButtonsCtn.firstElementChild;
    if(inputData.endButtons?.evaluateItem === "none") {
      responseEndButtonsCtn.style.display = "none";
    }
    responseEndButtonsCtn.querySelector(".ai-text-continue-button").onclick = function() {
      // console.debug("wrapper display:", this.closest('.ai-text-response-buttons-wrapper').style.display);
      let responseCtn = this.closest(".ai-text-response-end-buttons-ctn").__aiTextResponseCtn || this.closest('.ai-text-response-ctn');
      continueAiTextResponseClickHandler(responseCtn);
    };
    responseEndButtonsCtn.querySelector(".ai-text-edit-button").onclick = function() {
      // console.debug("wrapper display:", this.closest('.ai-text-response-buttons-wrapper').style.display);
      let responseCtn = this.closest(".ai-text-response-end-buttons-ctn").__aiTextResponseCtn || this.closest('.ai-text-response-ctn');
      editAiTextResponseClickHandler(responseCtn);
    };
  }
  
  function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }
  
  let startWithRegex;
  
  function renderResponseTextIntoContainer(response, opts={}) {
    if(!inputData.outputTo && !placeholderEl) return; // <-- indicates that they're doing things manually with e.g. onFinishPromise/onChunk/etc.
    
    if(hideStartWith) { // note that `hideStartWith` is purely 'visual' - it's just a handy helper for a common case (that could otherwise be solved with `render`)
      if(!startWithRegex) startWithRegex = new RegExp("^"+escapeRegExp(concreteInputs.startWith));
      response = response.replace(startWithRegex, "");
    }
    if(inputData.render) {
      response = inputData.render({text:response, isPartial:!opts.isFinalRender});
    }
    if(inputData.outputTo) {
      if(typeof inputData.outputTo.value == "string") { // textarea, input, or user's custom object with string `.value` property
        inputData.outputTo.value = response;
        if(inputData.outputTo.tagName === "TEXTAREA") {
          if(inputData.outputTo.scrollTop > (inputData.outputTo.scrollHeight - inputData.outputTo.offsetHeight)-30) { // <-- if the text box is already scrolled near the end of the text
            inputData.outputTo.scrollTop = 9999999999; // scroll down to bottom of text box
          }
        }
      } else {
        inputData.outputTo.innerHTML = response;
        if(opts.addEndButtons) {
          responseEndButtonsCtn.title = `Inputs that were used:\n\ninstruction=${concreteInputs.instruction}\n\nstartWith=${concreteInputs.startWith}`;
          responseEndButtonsCtn.__aiTextResponseCtn = inputData.outputTo;
          inputData.outputTo.append(responseEndButtonsCtn);
        }
      }
    } else {
      if(typeof placeholderEl.value == "string") { // textarea, input, or user's custom object with string `.value` property
        placeholderEl.value = response;
      } else {
        placeholderEl.innerHTML = response;
        if(opts.addEndButtons) {
          responseEndButtonsCtn.title = `Inputs that were used:\n\ninstruction=${concreteInputs.instruction}\n\nstartWith=${concreteInputs.startWith}`;
          placeholderEl.append(responseEndButtonsCtn);
        }
      }
    }
  }
  
  let gotFirstChunk = false;
  let chunks = [];
  let generatedChunks = []; // difference from `chunks` is that this doesn't include the user-specified `startWith` text
  let alreadyDoneOnFinishStuff = false; // just as an extra guard against bugs
  
  function doOnFinishStuff({stopReason}) {
    if(alreadyDoneOnFinishStuff) return; // this is possible because e.g. userland onChunk can synchronously call .stop(), so it gets executed after last chunk arrival via stopFn(), but before 'normal' doOnFinishStuff call
    alreadyDoneOnFinishStuff = true;

    console.debug("FINISHED STREAMING.");

    let finishData = new String(chunks.join(""));
    finishData.text = chunks.join("");
    finishData.generatedText = generatedChunks.join("");
    finishData.stopReason = stopReason;

    if(inputData.onFinish) {
      try { inputData.onFinish(finishData); } catch(e) { console.error("error in onFinish:", e); }
    }
    onFinishPromiseResolver(finishData);
    generatedText = generatedChunks.join("");

    if(textareaLoadingIndicatorHandler) textareaLoadingIndicatorHandler.stop();
    try { textStreamController.close(); } catch(e) { console.error(e); }
  }
  function stopFn() {
    if(finishedGenerating) return;
    finishedGenerating = true;

    if(!gotFirstChunk && placeholderEl) placeholderEl.innerHTML = ""; // clear the svg 'loading' dots

    doOnFinishStuff({stopReason:"user"});
  }

  async function startStreamingResponse() {
    try {
      (async function() {
        await new Promise(r => setTimeout(r, 500));
        while(true) {
          if(userStoppedGeneration) {
            console.debug("stopping keepalives due to `userStoppedGeneration`");
            break;
          }
          if(finishedGenerating) { console.debug("stopping keepalives due to `finishedGenerating`"); break; }
          if(placeholderElDidInitiallyExist && !document.querySelector(`#${completionId}`)) { console.debug("stopping keepalives due to `placeholderEl`"); break; } // placeholderEl no longer exists in the DOM, so user probably clicked 'randomize' or whatever while previous one was still loading, hence we abort previous one by stopping the keepalives, which drops it from the queue
          if(inputData.outputTo && (!document.body.contains(inputData.outputTo) || inputData.outputTo.dataset.aiTextCompletionId !== completionId))  { console.debug("stopping keepalives due to `outputTo`"); break; }
          // if(lastGeneratedChunkReceivedTime !== null && Date.now()-lastGeneratedChunkReceivedTime > 1000*20)  { console.debug("stopping keepalives due to generation having started but no new chunks Received in 20 seconds"); break; }
          
          iframe.contentWindow.postMessage({ type: "streamKeepAlive", requestId:completionId }, serverOrigin);
          console.debug("streamKeepAlive sent");
          await new Promise(r => setTimeout(r, 800));
          // if(window.devTest98375290385) await new Promise(r => setTimeout(r, 10000000000));
        }
        try { stopFn(); } catch(e) { console.error(e); }; // need to call stopFn() here (and not just wait for it to be called in streamTextFromIframe) because otherwise it only gets called if streamTextFromIframe gets called again, which it *might not*
        try { iframe.contentWindow.postMessage({ type: "stopStream", requestId:completionId }, serverOrigin); } catch(e) { console.error(e); };
      })();
      
      streamTextFromIframe(function(data) {
        if(userStoppedGeneration) {
          if(!finishedGenerating) stopFn();
          return;
        }
        if(placeholderElDidInitiallyExist && !document.querySelector(`#${completionId}`)) {
          if(!finishedGenerating) stopFn();
          return;
        }
        if(inputData.outputTo && (!document.body.contains(inputData.outputTo) || inputData.outputTo.dataset.aiTextCompletionId !== completionId)) {
          if(!finishedGenerating) stopFn();
          return;
        }
        if(finishedGenerating) {
          thereWasAnErrorDuringGeneration = true;
          console.error("We received a chunk of text even though we've already finishedGenerating?");
          return;
        }
        
        // add the startWith chunk before the first 'real' chunk:
        if(data.isFirstChunk && concreteInputs.startWith && !hideStartWith) {
          chunks.push(concreteInputs.startWith);
          textStreamController.enqueue(concreteInputs.startWith);
          if(inputData.onChunk) {
            inputData.onChunk({fullTextSoFar:chunks.join(""), textChunk:concreteInputs.startWith, isFromStartWith:true});
          }
        }
        
        if(data.error) {
          let allChunksJoined = chunks.join("");
          thereWasAnErrorDuringGeneration = true;
          finishedGenerating = true;
          
          concreteInputs.startWith = allChunksJoined;
          renderResponseTextIntoContainer(allChunksJoined, {addEndButtons:true, isFinalRender:true});
          
          doOnFinishStuff({stopReason:"error"});
        } else {
          generationLastKnownToBeWorkingAt = Date.now();
          if(data.isFirstChunk) {
            gotFirstChunk = true;
            if(placeholderEl) placeholderEl.innerHTML = ""; // clear the svg 'loading' dots
            if(inputData.beforeFirstChunk) {
              inputData.beforeFirstChunk({});
            }
          }
          
          generatedChunks.push(data.text);
          chunks.push(data.text);
          textStreamController.enqueue(data.text);
          
          if(inputData.onChunk) {
            try { // user-land handler may throw error
              inputData.onChunk({fullTextSoFar:chunks.join(""), textChunk:data.text}); // `data.text` is the full text so far (like in onFinish, render, etc.), and `data.chunk` is the most recent chunk (the one that triggered this call to onChunk)
            } catch(e) {
              console.error("Error in onChunk:", e);
            } 
          }

          onFinishPromise.liveResponseText = chunks.join("");
          
          renderResponseTextIntoContainer(chunks.join(""), {addEndButtons:!!data.isLastChunk, isFinalRender:!!data.isLastChunk});
          if(data.isLastChunk) {
            concreteInputs.startWith = chunks.join(""); // update the startWith for 'continue' and 'edit' button use
            finishedGenerating = true;
            doOnFinishStuff({stopReason:data.stopReason});
          }
        }
      });    

    } catch(e) {
      thereWasAnErrorDuringGeneration = true;
      finishedGenerating = true;
      // onFinishPromiseRejecter();
      doOnFinishStuff({stopReason:"error"});
      
      console.error(e);
      await new Promise(r => setTimeout(r, 1000));
      iframe.contentWindow.postMessage({type:"verifyUser"}, serverOrigin); // probably not necessary, but just in case (it'll only re-verify if it's actually needed anyway)
    }
  }
  
  function onVisible(element, callback) {
    new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if(entry.intersectionRatio > 0) {
          callback(element);
          observer.disconnect();
        }
      });
    }).observe(element);
    if(!callback) return new Promise(r => callback=r);
  }
    
  setTimeout(async () => {
    // give placeholderEl a chance to be put into the DOM
    placeholderEl = document.querySelector(`#${completionId}`); // this will be null if they're using outputTo or are just doing things fully manually onFinishPromise/onChunk/etc.
    if(placeholderEl) placeholderElDidInitiallyExist = true;
    // wait for placeholderEl to become visible:
    if(placeholderElDidInitiallyExist && !inputData.outputTo) {
      await onVisible(placeholderEl);
    }
    
    if(inputData.onStart) {
      inputData.onStart(onFinishPromise); // note that `onFinishPromise` has all the data attached, like `inputs`, `liveResponseText`, etc. - see below
      if(inputData.outputTo && inputData.outputTo.tagName === "TEXTAREA") {
        try { textareaLoadingIndicatorHandler = addTextareaLoadingIndicator(inputData.outputTo); } catch(e) { console.error(e); } // try/catch because new code
      }
    }
    startStreamingResponse(); 
  }, 100);
  
  let beforeLoaderHtml = "";
  if(!inputData.outputTo && !hideStartWith) {
    beforeLoaderHtml = inputData.render ? inputData.render({text:concreteInputs.startWith, isPartial:true}) : concreteInputs.startWith;
  }
  
  if(inputData.outputTo) {
    inputData.outputTo.dataset.aiTextCompletionId = completionId; // this is used for keepalive stuff - if a queued request is going to output to an outputTo element, but that element no longer has the correct `dataset.aiTextCompletionId` then we drop it from the queue
  }
  
  onFinishPromise.inputs = originalConcreteInputs;
  onFinishPromise.liveResponseText = concreteInputs.startWith; // this is full text (including startWith, which is why this property isn't called liveGeneratedText, or liveOutputText) and is live-updated as chunks come in. and note that it can also be edited by the user using the end buttons
  onFinishPromise.textStream = textStream;
  onFinishPromise.onFinishPromise = onFinishPromise; // backwards-compat with old return object
  onFinishPromise.stop = () => {
    userStoppedGeneration = true;
    try { stopFn(); } catch(e) { console.error(e); };
    try { iframe.contentWindow.postMessage({ type: "stopStream", requestId:completionId }, serverOrigin); } catch(e) { console.error(e); };
    return onFinishPromise; // <-- so .stop() returns the output data
  };
  onFinishPromise.id = completionId;
  onFinishPromise.loadingIndicatorHtml = animatedLoadingSvg; // <-- just a littler helper for people who are e.g. using onFinishPromise/onChunk/etc. but want to add a loading indicator to the page manually
  onFinishPromise.toString = function() { // this object stringifies into the default placeholder element
    return `<span class="ai-text-response-ctn" id="${completionId}" style="white-space:pre-wrap; ${inputData.style ? inputData.style : ""}">${beforeLoaderHtml}${animatedLoadingSvg}</span>`;
  };
  onFinishPromise.submitUserRating = async ({score, reason}) => {
    if(!finishedGenerating || thereWasAnErrorDuringGeneration) {
      console.error(thereWasAnErrorDuringGeneration ? "cannot rate because there was an error during generation" : "cannot rate because it hasn't finished generating yet");
      return;
    }
    if(isNaN(Number(score)) || Number(score) > 1 || Number(score) < 0) return alert(`User rating should be a value between 0 (bad) and 1 (good). Like 0.4 or 0.8, for example.`);
    score = Number(score);
    if(!reason) reason = "";
    iframe.contentWindow.postMessage({ type: "rateGeneratedText", instruction, startWith, generatedText, generatorName:window.generatorName, score, reason }, serverOrigin);
  };
  return onFinishPromise;

// this was causing user-agent styles (specifically background color) to be removed in dark mode in chrome for some reason.
// it's a little too obtrusive anyway - ideally it would just be a "sliding line" that's only at the bottom of the textarea.
// or maybe a transparent loading indicator in the top-right of the textarea.
addTextareaLoadingIndicator(el) =>
  // const computedStyle = getComputedStyle(el);
  // const borderColor = computedStyle.borderColor;
  // // Convert border color to rgba with 30% opacity
  // const rgbaColor = borderColor.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, 'rgba($1, $2, $3, 0.3)');
  // const className = 'blink-' + Math.random().toString(36).substring(2, 15);
  // const style = document.createElement('style');
  // style.innerHTML = `
  //   @keyframes ${className}-blink {
  //     0%, 100% {
  //       border-color: ${borderColor};
  //     }
  //     50% {
  //       border-color: ${rgbaColor};
  //     }
  //   }
  //   .${className} {
  //     animation: ${className}-blink 1s infinite;
  //     border-color: ${borderColor}; /* must add this explicitly, since user-agent-only borders don't trigger the animation */
  //   }
  // `;
  // document.head.appendChild(style);
  // el.classList.add(className);
  return {
    stop: function() {
      // el.classList.remove(className);
      // document.head.removeChild(style);
    },
  };

character
  {mech|demon|cyberpunk} {warrior|minion|samurai}

place
  a retropunk distopia
  a small village
  a mountainous region
  an underwater cavern
  a = 10

season
  winter
  summer
  
poemPrompt
  instruction = Write a haiku about a [character] in [place] during [season].
```

## Perchance Right Side HTML

```html
<div style="display:[window.generatorName === 'ai-text-plugin' ? 'none' : 'block'];color:red; font-weight:bold; padding:3rem;">Heads up! This is a fork/remix of the <a href="/ai-text-plugin" target="_blank">ai-text-plugin</a>, but unfortunately it's a really bad idea to fork this plugin, since its code is 'coupled' with the server code, so if I need to change the server code, your version of this plugin will likely break. If you'd like new features, best to ask for them on the community forum so your generators don't randomly break in the future when I update the server code. Alternatively, you can create a new plugin that <u>imports the official version of this plugin</u> - basically create a "wrapper" plugin that changes/expands on the plugin's behavior.</div>

<h1>🖋️📜 AI Text Plugin 📖🤖</h1>

<main>
  <p>This plugin allows you generate text with AI. It doesn't run on your actual device like other Perchance plugins because it requires too much computational power (and would require a many-gigabyte download), so it runs on <a href="https://en.wikipedia.org/wiki/Server_(computing)" target="_blank">server</a> GPUs, which means it costs me money to run. For that reason, this plugin is funded with ads, so <b style="color:red;">an ad will appear on your generator <u>for non-logged-in users</u> if you import this plugin</b>. The ad will appear at the bottom of the screen <a href="https://user.uploads.dev/file/e3cdfc34728610cf6e351b72052ef0c1.jpeg" target="_blank" title="graphic design is my passion">like this</a>. The ad will go away if you remove the plugin, of course.</p>
  
  <p>To use this plugin, you'll first need to import it by adding this line to your lists editor:</p>
<pre>
ai = \{import:ai-text-plugin\}
</pre>
  <p>And now try putting this in your lists editor:</p>
<pre>
character
  \{mech|demon|cyberpunk\} \{warrior|minion|samurai\}

place
  a retropunk distopia
  a small village
  a mountainous region
  an underwater cavern

season
  winter
  summer
  
poemPrompt
  instruction = Write a haiku about a \[character\] in \[place\] during \[season\].
  
output
  \[ai(poemPrompt)\]
</pre> 
  <p><a href="https://perchance.org/ai-text-plugin-poem-example-1#edit" target="_blank">Here's an example generator</a> to start you off, and here's a live version of the above code, running on this page:</p>
  <p id="outputEl1" style="text-align:center;">[$output(poemPrompt)]</p>
  <p style="text-align:center;"><button onclick="update(outputEl1)">randomize</button></p>
  
  <p>You can hover your mouse over the little icon that appears at the end of the text to see the instruction that was used to generate it.</p>
  <p>Here's an example where we give the AI an instruction, but we also ensure that the response starts with "It was the night before Christmas in":</p>
<pre>
storyPrompt
  instruction = Write a \{spooky|silly\} story involving \{a\} \{import:object\}.
  startWith = It was the night before Christmas in
</pre>
  <p><a href="https://perchance.org/ai-character-design-example-simple#edit" target="_blank">Here's a simple example</a> that uses <code>startWith</code>.</p>
  
  <p>If you pass some text directly into this plugin, it'll be interpreted as the <code>instruction</code>:</p>
<pre>
output
  \[ai("Explain quantum field theory to a toddler.")\]
</pre> 
  <p>Check out some of these example generators to see different ways to use this plugin, and learn about some advanced features:</p>
 <ul>
    <li><a style="font-weight:bold;" href="https://perchance.org/ai-character-design-example#edit" target="_blank">Fantasy Character</a> - Description + image using <code>onFinish</code> and <a href="/text-to-image-plugin" target="_blank">text-to-image-plugin</a>.</li>
      <li><a style="font-weight:bold;" href="https://perchance.org/ai-text-plugin-tester#edit" target="_blank">Prompt Tester</a> - Easily test your prompts. Also demonstrates <code>outputTo</code> property.</li>
    <li><a style="font-weight:bold;" href="https://perchance.org/ai-chat-example#edit" target="_blank">AI Chat</a> - Design and chat with an AI character. Uses <code>stopSequences</code> and <code>onFinish</code>.</li>
    <li><a style="font-weight:bold;" href="https://perchance.org/ai-text-plugin-render-example#edit" target="_blank">Render Example</a> - Displays 'actions' like *smiles smugly* into <i style="opacity:0.6;">smiles smugly</i> using <code>render</code>.</li>
    <li><a style="font-weight:bold;" href="https://perchance.org/random-character-chat-example#edit" target="_blank">Two Character Chat</a> - Makes 2 random game characters chat with one another.</li>
    <li><a style="font-weight:bold;" href="https://perchance.org/ai-short-story-generator-example#edit" target="_blank">Short Story</a> - Generates a short story with pictures. Uses <code>render</code> in an interesting way.</li>
    <li><a style="font-weight:bold;" href="https://perchance.org/ai-story-outline-generator-example#edit" target="_blank">Story Outline</a> - Generates a story outline (plot, characters, etc.) with a cover image.</li>
    <li><a style="font-weight:bold;" href="https://perchance.org/ai-text-plugin-text-to-speech-example#edit" target="_blank">Text-to-Speech</a> - Streams generated text into the <a href="/text-to-speech-plugin" target="_blank">text-to-speech-plugin</a>.</li>
    <li><a style="font-weight:bold;" href="https://perchance.org/ai-story-writing-helper-example#edit" target="_blank">Story Writing Helper</a> - Shows use of <code>onChunk</code> and <code>stop()</code>.</li> 
    <li><a style="font-weight:bold;" href="https://perchance.org/ai-text-adventure-example#edit" target="_blank">Multi-Choice Text Adventure</a> - Story where each step has several actions to choose from.</li>
    <li><a style="font-weight:bold;" href="https://perchance.org/ai-generated-hierarchical-world-example#edit" target="_blank">Hierarchical World Explorer</a> - Similar to the <a href="https://perchance.org/nested-plugin" target="_blank">nested-plugin</a>.</li>
    <li><a style="font-weight:bold;" href="https://perchance.org/ai-text-example-with-user-input#edit" target="_blank">User Input Example</a> - Take some user input as part of the writing instructions for the AI.</li>
 </ul>
  
  <p>You can make <code>instruction</code> and/or <code>startWith</code> into a list, and then add <code style="white-space:pre;">$output = \[this.joinItems("\\n")\]</code> to the top of the list to join all the lines together like in <a href="https://perchance.org/ai-text-plugin-multi-line-example#edit" target="_blank">this example</a>:</p>
<pre>
catGymPrompt
  startWith
    cat: i umm... *muffled heavy breathing* i am a cat, and i'm calling to ask about your tuesday pilates classes
    kind staff member: sure! i can help you with that, can-
    cat:
    $output = \[this.joinItems("\\n")\] <span style="opacity:0.5">// &lt;-- this joins all the above lines together instead of selecting a random one</span>
</pre>
  <p style="font-size:80%;"><b>Note:</b> You might be accustomed to using <code>this.joinItems("&lt;br&gt;")</code>, but in this case <code>\\n</code> (which means <b>n</b>ewline) is probably better since the AI is trained primarily on text, rather than HTML (but it definitely can generate HTML if you need that!). I've made it so <code>\\n</code> does actually create a line break in the visual display of the AI's outputs (most HTML element types don't do this <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/white-space" target="_blank">by default</a>).</p>
  
  <p><a href="https://perchance.org/mario-ai-therapist#edit" target="_blank">Here's</a> how to add a <code>style</code> option to adjust the visual display of the output text:</p>
<pre>
marioAffirmationsPrompt
  instruction = Be Mario, and give me 3 positive affirmations with Mario's accent.
  style = text-align:left; color:blue; font-weight:bold; border:2px solid red; display:block; max-width:600px; margin:0 auto; padding:0.5rem; 
</pre>
  
  <p><b>Prompt Options:</b></p>
  <p>You can see a bunch of the options below at play in the example generators listed above, and in <a href="https://perchance.org/ai-text-plugin-demo" target="_blank">this sandbox demo</a> made by <a href="https://lemmy.world/u/wthit56" target="_blank">wthit56</a>.</p>
 <ul>
    <li><code style="font-weight:bold;">instruction</code> - Your instruction to the AI on what to write.</li>
    <li><code style="font-weight:bold;">startWith</code> - The text that you want the AI's writing to start with.</li>
    <li><code style="font-weight:bold;">stopSequences</code> - The AI will stop writing "naturally" when it thinks it's finished, but you can use <code>stopSequences</code> to provide a list of words/phrases that should make the AI stop if it writes them.</li>
    <li><code style="font-weight:bold;">hideStartWith</code> - set this equal to <code>true</code> if you don't want the <code>startWith</code> text that you specified to actually get displayed. I.e. only the text <i>after</i> that will get displayed. You could also use a custom <code>render(data)</code> function (explained below) to achieve this.</li>
    <li><code style="font-weight:bold;">outputTo</code> - Use this to tell the plugin to output the AI's response into a specific element, based on that element's ID. If you had an element with <code>id="myCoolElement"</code> in the HTML editor, then you'd write <code>outputTo = \[myCoolElement\]</code> to get the AI to output to that element. By default the AI's text will be put wherever you write <code>\[ai(...)\]</code>.</li>
    <li><code style="font-weight:bold;">onChunk(data)</code> - the code you put in this will run after every chunk (which is usually a word, or part of a word). See <a href="https://perchance.org/ai-story-writing-helper-example#edit" target="_blank">this</a> generator for an example that uses it. You can access <code>data.textChunk</code> and <code>data.fullTextSoFar</code> and <code>data.isFromStartWith</code> (since the <code>startWith</code> text, if specified, is <u>always</u> the first chunk).</li> 
    <li><code style="font-weight:bold;">onStart(data)</code> - the code you put in this will run at the start of the generation process. You can access the inputs being used with <code>data.inputs.instruction</code>, <code>data.inputs.startWith</code>, etc.</li>
    <li><code style="font-weight:bold;">onFinish(data)</code> - the code you put in this will run at the end of the generation process. You can access the final text with <code>data.text</code>, and note that this <b>includes</b> the <code>startWith</code> text, if you specified any. If you want the output text <b>excluding</b> the <code>startWith</code>, then you can access that via <code>data.generatedText</code>. If you didn't specify any <code>startWith</code> then <code>data.generatedText</code> and <code>data.text</code> will be the same. You can use <code>data.liveResponseText</code> at any time to get the current text <i>including any edits that the user has made</i> using the edit button at the end of the response.</li>
    <li><code style="font-weight:bold;">render(data)</code> - the code you put in this will run after every chunk, and value that you <code>return</code> from this function is what actually gets displayed. This allows you to transform what the AI writes into something else - e.g. convert asterisks around text to bold or italic HTML tags. <code>data.text</code> contains the text so far and <code>data.isPartial</code> tells you whether the text is partial/incomplete (i.e. the AI is still generating). <a href="https://perchance.org/ai-text-plugin-render-example#edit" target="_blank">Here's</a> a basic example, and <a href="https://perchance.org/ai-short-story-generator-example#edit" target="_blank">here's</a> one that uses <code>data.isPartial</code>.</li>
    <li><code style="font-weight:bold;">endButtons</code> - add <code>endButtons = none</code> to your prompt options if you don't want the edit/continue buttons to show at the end of the response.</li>
    <li>Note that <code>instruction</code>, <code>startWith</code>, and <code>stopSequences</code> can all be <i>functions</i> if you want. You return the value that you want to use. See <a href="https://perchance.org/ai-text-plugin-tester#edit" target="_blank">this</a> generator for an example where we use it to prevent evaluation of the square and curly blocks in the given <code>instruction</code> and <code>startWith</code>.</li>
    <li>There are some other features not listed here, but they're used in the examples list above. If there's a feature that you want, but can't find, feel free to ask for it on the community forum.</li>
 </ul>
  <p>Here's an example of using it in JavaScript function where we <code>console.log</code> each chunk, and also the final <code>generatedText</code>:</p>
<pre>
async start() =>
  let result = await ai(\{
    instruction: "write a poem",
    onChunk: function(data) \{
      console.log("chunk:", data);
    \},
  \});
  console.log(result.generatedText, result);
</pre>
  <p>The <code>result.text</code> includes the <code>startWith</code> text, whereas <code>result.generatedText</code> doesn't, but in the above example they're equivalent because we didn't specify a <code>startWith</code>. Also note that <code>result</code> is also actually a <code>String</code> which is equivalent to <code>result.text</code>. So you can just write e.g. <code>foo.innerHTML = result</code> instead of <code>foo.innerHTML = result.text</code>.</p>
 <p><b>Notes:</b></p>
 <ul>
    <li>Text prompt/response data is <b>not</b> stored on the server - see <a href="https://lemmy.world/comment/5709061" target="_blank">this post</a> for more info.</li>
    <li>If you'd like to play around with running AI text generation models on your own machine ("locally"), then <a href="https://www.reddit.com/r/LocalLLaMA/top/?t=month" target="_blank">r/LocalLLama</a> is a good community to join.</li>
    <li>Each user can only have a few concurrent server requests, so if you have lots of completions pending on one page, they'll queue up.</li>
    <li>The model <b>may produce NSFW/adult-themed content</b> if instructed/prompted with NSFW/adult-themed terms. You should <b>treat this a bit like a Google search</b> - ask for inappropriate stuff, and you'll probably get inappropriate stuff. Please prompt responsibly. If the AI is producing inappropriate content without being prompted, you can try adding a sentence to your <code>instruction</code> telling it not to do that.</li>
    <li>The 19th day of every month is observed as 'Ad-viewer Appreciation Day' in the Perchance community. On this day we pay our respects to the non-logged-in users who fund the GPU servers by viewing ads on generators that import AI-based plugins. Logged-in users are encouraged to spare a moment for these anonymous benefactors, wishing for them a month of relevant and interesting ads, and thanking them for their tolerance of increased browser tab memory usage, and their indirect but valuable contribution to the Perchance community via the digital attention economy. May their mobile game ads not be too sus, and may the gameplay reflect the real gameplay even if only abstractly 🕯️</li>
    <li>Check out more plugins at <a href="/plugins">perchance.org/plugins</a></li>
 </ul>
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
  main p:first-child {
    margin-top:0;
  }
  ul li {
  margin-top:0.5em; 
 }
 p {
    line-height: 1.4em;
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
