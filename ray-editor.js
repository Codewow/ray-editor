class RayEditor {
   constructor(containerId, options = {}) {
      this.container = document.getElementById(containerId);
      this.options = options;
      this.toolbar = null;
      this.editorArea = null;
      this.imageUploadUrl = null
      this.maxImageSize = null
      this.init();
   }
   init() {
      this.createToolbar();
      this.createEditorArea();
      this.bindEvents();
      this.addWatermark()
   }
   createToolbar() {
      this.toolbar = document.createElement('div');
      this.toolbar.className = 'ray-editor-toolbar';
      this.container.appendChild(this.toolbar);
      this.generateToolbarButtons(buttonConfigs);
   }
   createEditorArea() {
      this.editorArea = document.createElement('div');
      this.editorArea.className = 'ray-editor-content';
      this.editorArea.contentEditable = true;
      this.editorArea.spellcheck = true;
      this.editorArea.innerHTML = '<p><br></p>';
      this.editorArea.innerHTML = `
         <p><b>This is bold text</b></p>
         <p><i>This is italic text</i></p>
         <p><u>This is underlined text</u></p>
         <p><strike>This is strikethrough text</strike></p>
         <p>This is normal text with no styles.</p>
         `;
      this.container.appendChild(this.editorArea);
   }
   addWatermark() {

      if (!this.editorArea) return;
      const watermark = document.createElement('div');
      watermark.id = 'ray-editor-watermark';
      watermark.innerHTML = `Made with ❤️ by <a href="https://rohanyeole.com" target="_blank" rel="noopener">Rohan Yeole</a>`;
      // Insert after the editor
      this.editorArea.parentNode.insertBefore(watermark, this.editorArea.nextSibling);
   
   }
   generateToolbarButtons(buttonConfigs) {
      // for (const key in this.options) {
      Object.keys(buttonConfigs).forEach((key) => {
         // Check if this key is enabled in userOptions
         if (!this.options[key]) return;

         if (this.options[key].imageUploadUrl && this.options[key].imageMaxSize) {
            this.imageUploadUrl = this.options[key].imageUploadUrl
            this.maxImageSize = this.options[key].imageMaxSize
         }
         if (this.options[key].fileUploadUrl && this.options[key].fileMaxSize) {
            this.fileUploadUrl = this.options[key].fileUploadUrl
            this.fileMaxSize = this.options[key].fileMaxSize
         }
         const config = buttonConfigs[key];
         if (config.dropdown && config.options) {
            this.createDropdown(config);
         } else {            
            this.createButton(config);
         }
      });
   }
   createDropdown(config) {
      const select = document.createElement('select');
      select.className = `ray-dropdown ray-dropdown-${config.keyname}`;
      select.title = config.keyname.charAt(0).toUpperCase() + config.keyname.slice(1);

      Object.entries(config.options).forEach(([key, opt]) => {
         const option = document.createElement('option');
         option.value = opt.value;
         option.textContent = opt.label;
         select.appendChild(option);
      });

      select.addEventListener('change', () => {
         const selected = config.options[select.selectedOptions[0].textContent.toLowerCase().replace(/\s/g, '')];
         if (selected?.cmd) {
            this.execCommand(selected.cmd, selected.value);
         }
      });

      this.toolbar.appendChild(select);
   }
   createButton(config) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = `ray-btn-${config.keyname}`;
      const formattedTitle = config.keyname.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      btn.title = formattedTitle;
      btn.setAttribute('data-tooltip', formattedTitle);
      btn.innerHTML = config.label;
      btn.className = `ray-btn ray-btn-${config.keyname}`;

      btn.addEventListener('click', () => {
         if (config.cmd) {
            this.execCommand(config.cmd, config.value || null);
         } else if (config.keyname === 'uppercase') {
            this.transformSelectedText('upper');
         } else if (config.keyname === 'lowercase') {
            this.transformSelectedText('lower');
         } else if (config.keyname === 'toggleCase') {
            this.toggleTextCase();
         } else if (config.keyname === 'codeBlock') {
            this.insertCodeBlock()
         } else if (config.keyname === 'codeInline') {
            this.insertInlineCode()
         } else if (config.keyname === 'backgroundColor') {
            this.applyBackgroundColor()
         } else if (config.keyname === 'textColor') {
            this.applyTextColor()
         } else if (config.keyname === 'imageUpload') {
            this.triggerImageUpload()
         } else if (config.keyname === 'fileUpload') {
            this.triggerFileUpload()
         }
      });

      this.toolbar.appendChild(btn);
   }
   execCommand(command, value = null) {
      document.execCommand(command, false, value);
      this.editorArea.focus();
   }
   bindEvents() {
      const events = ['keyup', 'mouseup', 'keydown', 'paste'];
      events.forEach(evt => {
         this.editorArea.addEventListener(evt, (e) => {
            const sel = window.getSelection();
            if (!sel.rangeCount) return;

            const node = sel.anchorNode;
            const elementNode = node.nodeType === 3 ? node.parentElement : node;

            if (evt === 'keydown') {
               this.handleCodeBlockExit(e, elementNode);
               this.handleInlineCodeExit(e, sel, elementNode);
            }

            if (evt === 'paste') {
               this.handleYoutubeEmbed(e);
            }
         });
      });
   }
   handleCodeBlockExit(e, elementNode) {
      if (e.key !== 'Enter' || e.shiftKey) return;

      const codeContent = elementNode.closest('.ray-code-content');
      if (!codeContent) return;

      const text = codeContent.innerText.trim();

      if (text === '') {
         e.preventDefault();

         codeContent.innerHTML = '';

         const newPara = document.createElement('p');
         newPara.innerHTML = '<br>';

         const codeBlock = codeContent.closest('.ray-code-block');
         if (codeBlock) {
            codeBlock.parentNode.insertBefore(newPara, codeBlock.nextSibling);

            const range = document.createRange();
            range.selectNodeContents(newPara);
            range.collapse(true);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
         }
      } else {
         codeContent.dataset.lastEmptyEnter = 'true';
         setTimeout(() => delete codeContent.dataset.lastEmptyEnter, 500);
      }
   }
   handleInlineCodeExit(e, sel, elementNode) {
      if (e.key !== 'ArrowRight') return;

      const inlineCode = elementNode.closest('code');
      if (!inlineCode || !sel.isCollapsed) return;

      const range = sel.getRangeAt(0);
      const atEnd = range.endOffset === inlineCode.textContent.length;

      if (atEnd) {
         e.preventDefault();

         const spacer = document.createTextNode('\u00A0');
         inlineCode.parentNode.insertBefore(spacer, inlineCode.nextSibling);

         const newRange = document.createRange();
         newRange.setStartAfter(spacer);
         newRange.collapse(true);

         sel.removeAllRanges();
         sel.addRange(newRange);
      }
   }
   handleYoutubeEmbed(e) {
      const clipboard = e.clipboardData || window.clipboardData;
      const pastedText = clipboard.getData('text');

      const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
      const match = pastedText.match(ytRegex);

      if (!match) return;

      e.preventDefault();

      const videoId = match[1];
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}`;
      iframe.width = '560';
      iframe.height = '315';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.className = 'ray-youtube-embed';

      const range = window.getSelection().getRangeAt(0);
      range.deleteContents();
      range.insertNode(iframe);
   }
   applyTextTransformation(transformFn) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const selectedText = range.toString();

      if (!selectedText.trim()) return;

      const transformed = transformFn(selectedText);

      range.deleteContents();
      range.insertNode(document.createTextNode(transformed));

      // Reset selection to after inserted text
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
   }
   transformSelectedText(mode) {
      this.applyTextTransformation((text) =>
         mode === 'upper' ? text.toUpperCase() : text.toLowerCase()
      );
   }
   toggleTextCase() {
      this.applyTextTransformation((text) =>
         [...text].map(char =>
            char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
         ).join('')
      );
   }
   insertCodeBlock() {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);

      // Create wrapper div
      const wrapper = document.createElement('div');
      wrapper.className = 'ray-code-block';

      // Create editable inner div
      const codeContent = document.createElement('div');
      codeContent.className = 'ray-code-content';
      codeContent.setAttribute('contenteditable', 'true');
      codeContent.innerHTML = '<br>';
      // Compose and insert
      wrapper.appendChild(codeContent);

      range.deleteContents();
      range.insertNode(wrapper);

      // Place cursor inside code content
      setTimeout(() => {
         const newRange = document.createRange();
         newRange.selectNodeContents(codeContent);
         newRange.collapse(true);
         const sel = window.getSelection();
         sel.removeAllRanges();
         sel.addRange(newRange);
      }, 0);
   }
   insertInlineCode() {
      const selection = window.getSelection();
      if (!selection.rangeCount || selection.isCollapsed) return;

      const range = selection.getRangeAt(0);
      const selectedText = range.toString();

      const parentCode = this.getSelectedElementInTag('code');

      if (parentCode) {
         // Already in code → unwrap it
         const parent = parentCode.parentNode;
         while (parentCode.firstChild) {
            parent.insertBefore(parentCode.firstChild, parentCode);
         }
         parent.removeChild(parentCode);
      } else {
         // Wrap selection in <code>
         const code = document.createElement('code');
         code.textContent = selectedText;

         range.deleteContents();
         range.insertNode(code);

         // Reselect inserted content
         const newRange = document.createRange();
         newRange.selectNodeContents(code);
         selection.removeAllRanges();
         selection.addRange(newRange);
      }
   }
   getSelectedElementInTag(tagName) {
      const sel = window.getSelection();
      if (!sel.rangeCount) return null;
      let node = sel.anchorNode;
      while (node && node !== document) {
         if (node.nodeType === 1 && node.tagName.toLowerCase() === tagName.toLowerCase()) {
            return node;
         }
         node = node.parentNode;
      }
      return null;
   }
   applyTextColor() {
      const input = document.createElement("input");
      input.type = "color";
      input.value = "#000000";
      input.style.position = "absolute";
      input.style.left = "-9999px"; // keep it hidden from view
      document.body.appendChild(input);

      input.oninput = () => {
         const color = input.value;
         this.execCommand("foreColor", color)
         input.remove(); // Clean up
      };

      input.click();
   }
   applyBackgroundColor() {
      const input = document.createElement("input");
      input.type = "color";
      input.value = "#ffffff";
      input.style.position = "absolute";
      input.style.left = "-9999px";
      document.body.appendChild(input);

      input.oninput = () => {
         const color = input.value;
         this.execCommand("backColor", color)
         input.remove();
      };

      input.click();
   }
   triggerImageUpload() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      input.addEventListener('change', () => {
         const image = input.files[0];
         if (!image) return;

         if (!image.type.startsWith('image/')) {
            alert('Only images are allowed.');
            return;
         }
         if (!this.maxImageSize || typeof this.maxImageSize !== 'number') {
            alert('❌ Configuration error: maxImageSize must be provided in bytes as a number.');
            return;
         }
         if (image.size > this.maxImageSize) {
            alert(`Image size must be under ${this.maxImageSize / (1024 * 1024)}MB.`);
            return;
         }
         this.handleImageUpload(image);
      });

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
   }
   handleImageUpload(image) {

      if (!this.imageUploadUrl) {
         console.error('Upload URL is not configured.');
         return;
      }

      const formData = new FormData();
      formData.append('file', image);

      const placeholder = this.insertUploadPlaceholder(image.name);

      fetch(this.imageUploadUrl, {
         method: 'POST',
         body: formData
      })
         .then(res => {
            if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);
            return res.json();
         })
         .then(data => {
            const imageUrl = data.url;
            if (!imageUrl) throw new Error('No image URL returned from server.');
            this.replacePlaceholderWithImage(placeholder, imageUrl, image.name);
         })
         .catch(err => {
            console.error('Image upload failed:', err);
            this.showUploadErrorWithRemove(placeholder, image.name);
         });
   }
   insertUploadPlaceholder(filename) {
      const placeholder = document.createElement('div');
      placeholder.className = 'upload-placeholder';
      placeholder.textContent = `Uploading ${filename}...`;
      this.editorArea.appendChild(placeholder);
      return placeholder;
   }
   replacePlaceholderWithImage(placeholder, imageUrl, imageName) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = imageName;
      img.title = imageName;
      // Set width and height once the image is fully loaded
      img.onload = () => {
         // Create resizable image and get both wrapper and editable line
         const { wrapper, editableLine } = this.makeImageResizable(img);

         // Replace placeholder with the resizable image wrapper
         placeholder.replaceWith(wrapper);

         // Insert the editable line AFTER the image wrapper
         wrapper.after(editableLine);

         // focus cursor in new line
         const range = document.createRange();
         const sel = window.getSelection();
         range.setStart(newLine, 0);
         range.collapse(true);
         sel.removeAllRanges();
         sel.addRange(range);
      }
   }
   showUploadErrorWithRemove(placeholder, imagename) {
      placeholder.innerHTML = `❌ Failed to upload "${imagename}"`;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.style.marginLeft = '10px';
      removeBtn.style.background = 'transparent';
      removeBtn.style.border = 'none';
      removeBtn.style.color = '#d00';
      removeBtn.style.cursor = 'pointer';

      removeBtn.onclick = () => placeholder.remove();
      placeholder.appendChild(removeBtn);
   }
   makeImageResizable(img) {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      wrapper.contentEditable = false;

      // Style image for better UX
      img.style.maxWidth = '100%';
      img.style.display = 'block';
      img.style.cursor = 'move';
      img.style.borderRadius = '4px';
      img.style.transition = 'box-shadow 0.2s ease';
      wrapper.appendChild(img);

      // Resize handle (visual indicator for dragging)
      const handle = document.createElement('div');
      handle.style.position = 'absolute';
      handle.style.width = '10px';
      handle.style.height = '10px';
      handle.style.right = '0';
      handle.style.bottom = '0';
      handle.style.cursor = 'se-resize';
      handle.style.background = 'hsl(220, 100%, 60%)';
      handle.style.border = '1px solid white';
      handle.style.borderRadius = '2px';
      handle.style.opacity = '0'; // Start hidden
      handle.style.transition = 'opacity 0.2s ease';
      wrapper.appendChild(handle);

      // Close Button (Top-Right)
      const closeBtn = document.createElement('div');
      closeBtn.innerHTML = '×';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '0';
      closeBtn.style.right = '0';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.background = 'hsla(0, 0%, 0%, 0.7)';
      closeBtn.style.color = 'white';
      closeBtn.style.width = '20px';
      closeBtn.style.height = '20px';
      closeBtn.style.borderRadius = '0 0 0 4px';
      closeBtn.style.display = 'flex';
      closeBtn.style.justifyContent = 'center';
      closeBtn.style.alignItems = 'center';
      closeBtn.style.opacity = '0';
      closeBtn.style.transition = 'opacity 0.2s ease';
      // Show/hide close button on hover/focus
      wrapper.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
      wrapper.addEventListener('mouseleave', () => closeBtn.style.opacity = '0');

      // Delete on click
      closeBtn.addEventListener('click', (e) => {
         e.stopPropagation();
         wrapper.remove(); // Remove entire resizable wrapper + image
      });

      wrapper.appendChild(closeBtn);
      // Add subtle border when image is active
      wrapper.addEventListener('click', (e) => {
         e.stopPropagation();
         img.style.boxShadow = '0 0 0 2px hsl(220, 100%, 60%)'; // Blue focus ring
         handle.style.opacity = '1'; // Show handle

         // Hide handle when clicking elsewhere
         setTimeout(() => {
            const clickOutsideHandler = () => {
               handle.style.opacity = '0';
               img.style.boxShadow = 'none';
               document.removeEventListener('click', clickOutsideHandler);
            };
            document.addEventListener('click', clickOutsideHandler);
         }, 0);
      });

      // **Insert editable new line AFTER the wrapper (not inside it)**
      const newLine = document.createElement('p');
      newLine.innerHTML = '<br>';
      // Resize logic (with aspect ratio lock)
      let startX, startY, startWidth, startHeight;
      // **Modified resizing logic (constrains aspect ratio)**
      handle.addEventListener('mousedown', (e) => {
         e.preventDefault();
         e.stopPropagation();
         startX = e.clientX;
         startY = e.clientY;
         startWidth = img.clientWidth;
         startHeight = img.clientHeight;
         img.style.boxShadow = '0 0 0 2px hsl(120, 100%, 25%)'; // Green during resize

         const doDrag = (e) => {
            const newWidth = startWidth + (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);
            img.style.width = `${Math.max(50, newWidth)}px`; // Min 50px
            img.style.height = `${Math.max(50, newHeight)}px`;
         };

         function stopDrag() {
            img.style.boxShadow = '0 0 0 2px hsl(220, 100%, 60%)'; // Revert to blue
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);
         }

         document.addEventListener('mousemove', doDrag);
         document.addEventListener('mouseup', stopDrag);
      });

      // **Return BOTH the wrapper AND the new line for proper insertion**
      return {
         wrapper,
         editableLine: newLine,
      };
   }
   triggerFileUpload() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*/*';
      input.style.display = 'none';

      input.addEventListener('change', () => {
         const file = input.files[0];
         if (!file) return;

         // Reject images here — we already handle those elsewhere
         if (file.type.startsWith('image/')) {
            alert('Use the image button for image uploads.');
            return;
         }

         if (!this.fileMaxSize || typeof this.fileMaxSize !== 'number') {
            alert('❌ Configuration error: fileMaxSize must be provided in bytes as a number.');
            return;
         }
         if (file.size > this.fileMaxSize) {
            alert(`File size must be under ${this.fileMaxSize / (1024 * 1024)}MB.`);
            return;
         }

         this.handleFileUpload(file);
      });

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
   }

   handleFileUpload(file) {

      if (!this.fileUploadUrl) {
         console.error('No file upload URL configured.');
         return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const placeholder = this.insertUploadPlaceholder(file.name);

      fetch(this.fileUploadUrl, {
         method: 'POST',
         body: formData
      })
         .then(res => {
            if (!res.ok) throw new Error(`Status ${res.status}`);
            return res.json();
         })
         .then(data => {
            const fileUrl = data.url;
            if (!fileUrl) throw new Error('No file URL returned.');
            this.replacePlaceholderWithFileLink(placeholder, file.name, fileUrl);
         })
         .catch(err => {
            console.error('File upload failed:', err);
            this.showUploadErrorWithRemove(placeholder, file.name);
         });
   }

   replacePlaceholderWithFileLink(placeholder, filename, url) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = filename;
      link.textContent = `📄 ${filename}`;
      link.style.textDecoration = 'underline';
      link.style.color = '#0366d6';

      placeholder.replaceWith(link);
   }
}
const buttonConfigs = {
   bold: {
      label: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bold-icon lucide-bold"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg>`,
      cmd: "bold",
      keyname: "bold"
   },
   italic: {
      label: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-italic-icon lucide-italic"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>`,
      cmd: "italic",
      keyname: "italic"
   },
   underline: {
      label: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-underline-icon lucide-underline"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>`,
      cmd: "underline",
      keyname: "underline"
   },
   strikethrough: {
      label: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-strikethrough-icon lucide-strikethrough"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/></svg>`,
      cmd: "strikeThrough",
      keyname: "strikeThrough"
   },
   undo: {
      label: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-undo2-icon lucide-undo-2"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>`,
      keyname: "undo",
      cmd: "undo"
   },
   redo: {
      label: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-redo2-icon lucide-redo-2"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/></svg>`,
      keyname: "redo",
      cmd: "redo"
   },
   superscript: {
      keyname: "superscript",
      label: "x²",
      cmd: "superscript"
   },
   subscript: {
      keyname: "subscript",
      label: "x₂",
      cmd: "subscript"
   },
   orderedList: {
      keyname: "orderedList",
      label: `<svg xmlns="http://www.w3.org/2000/svg" class="lucide lucide-list-ordered" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h1v4"/><path d="M4 14h1v4"/></svg>`,
      cmd: "insertOrderedList"
   },
   unorderedList: {
      keyname: "unorderedList",
      label: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-icon lucide-list"><path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/></svg>`,
      cmd: "insertUnorderedList"
   },
   uppercase: {
      label: "ABC",
      keyname: "uppercase",
   },
   lowercase: {
      label: "abc",
      keyname: "lowercase",
   },
   headings: {
      dropdown: true,
      keyname: 'heading',
      options: {
         paragraph: { label: 'Paragraph', cmd: 'formatBlock', value: '<p>' },
         heading1: { label: 'Heading 1', cmd: 'formatBlock', value: '<h1>' },
         heading2: { label: 'Heading 2', cmd: 'formatBlock', value: '<h2>' },
         heading3: { label: 'Heading 3', cmd: 'formatBlock', value: '<h3>' },
         heading4: { label: 'Heading 4', cmd: 'formatBlock', value: '<h4>' },
         heading5: { label: 'Heading 5', cmd: 'formatBlock', value: '<h5>' },
         heading6: { label: 'Heading 6', cmd: 'formatBlock', value: '<h6>' }
      }
   },
   toggleCase: {
      keyname: "toggleCase",
      label: "Tg",
   },
   codeBlock: {
      keyname: "codeBlock",
      label: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-icon lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
   },
   codeInline: {
      keyname: "codeInline",
      label: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevrons-left-right-ellipsis-icon lucide-chevrons-left-right-ellipsis"><path d="m18 8 4 4-4 4"/><path d="m6 8-4 4 4 4"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>`,
   },
   backgroundColor: {
      keyname: 'backgroundColor',
      label: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paintbrush-icon lucide-paintbrush"><path d="m14.622 17.897-10.68-2.913"/><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"/><path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"/></svg>',  // Background color icon
   },
   textColor: {
      keyname: 'textColor',
      label: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brush-icon lucide-brush"><path d="m11 10 3 3"/><path d="M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z"/><path d="M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031"/></svg>',
   },
   imageUpload: {
      keyname: "imageUpload",
      label: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-icon lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
   },
   fileUpload: {
      keyname: "fileUpload",
      label: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-icon lucide-file"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`,
   }
}

