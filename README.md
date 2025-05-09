Here's the updated **README.md** with the image you provided added under the **Features** section for visual representation:

---

# ✨ RayEditor — Lightweight Rich Text Editor

**RayEditor** is a modern, customizable, and lightweight WYSIWYG content editor built with pure JavaScript. It offers a seamless writing experience with support for rich text formatting, code blocks, media uploads, and more. Perfect for blogs, CMS platforms, documentation tools, and any web application requiring rich content editing.

---

## 🖼️ Preview

![image](https://github.com/user-attachments/assets/291f8d9a-c9a0-4f63-a059-ef6bceb7b0d5)

---

## 🚀 Features

### ✍️ Text Formatting

* **Bold, Italic, Underline, Strikethrough**
  Standard rich text styling options.
* **Uppercase, Lowercase, Toggle Case**
  Easily transform selected text casing.
* **Subscript & Superscript**
  Great for scientific and mathematical content.

### 🧱 Headings & Lists

* **Headings**
  Supports H1 to H6.
* **Ordered & Unordered Lists**
  Create structured content effortlessly.

### 🔄 Undo/Redo

* Quickly revert or reapply actions as needed.

### 🔤 Case Transformations

* Change casing for selected text using one click.

### 💻 Code Support

* **Inline Code**
  Highlight code snippets inline.
* **Code Blocks**
  Insert multi-line formatted code blocks.

### 🎨 Color Customization

* **Text Color**
  Pick a color for text.
* **Background Color**
  Highlight text with background color.

### 🖼️ Image Upload

* Upload and insert images.
* Configurable upload URL and file size limits.
* Resize, drag, and remove images easily.

### 📄 File Upload

* Upload and attach documents or media files.
* Size limits and upload endpoints are customizable.

---

## 🛠️ Setup Guide

### 1. Include RayEditor via CDN

```html
<!-- RayEditor CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rayeditor@latest/ray-editor.css">

<!-- RayEditor JS -->
<script src="https://cdn.jsdelivr.net/npm/rayeditor@latest/ray-editor.js"></script>
```

### 2. Add an Editor Container

```html
<div id="content" class="ray-content-editor"></div>
```

### 3. Initialize RayEditor

```javascript
document.addEventListener('DOMContentLoaded', () => {
   const editor = new RayEditor('content', {
      bold: true,
      italic: true,
      underline: true,
      strikethrough: true,
      redo: true,
      undo: true,
      headings: true,
      lowercase: true,
      uppercase: true,
      superscript: true,
      subscript: true,
      orderedList: true,
      unorderedList: true,
      toggleCase: true,
      codeBlock: true,
      codeInline: true,
      imageUpload: {
         imageUploadUrl: '/img-upload-path/',
         imageMaxSize: 20 * 1024 * 1024 // 20MB
      },
      fileUpload: {
         fileUploadUrl: '/file-upload-path/',
         fileMaxSize: 20 * 1024 * 1024 // 20MB
      },
      textColor: true,
      backgroundColor: true
   });
});
```

---

## 📦 Configuration Options

* **Toolbar Buttons**: Toggle each tool individually via boolean flags.
* **imageUpload**:

  * `imageUploadUrl`: Upload endpoint for images.
  * `imageMaxSize`: Max file size in bytes.
* **fileUpload**:

  * `fileUploadUrl`: Upload endpoint for files.
  * `fileMaxSize`: Max file size in bytes.

---

## ✅ Benefits

* Lightweight and dependency-free.
* Highly customizable.
* Extendable and framework-agnostic.
* Easy to integrate and use.

---

## 🔗 Resources

* **GitHub**: [yeole-rohan/ray-content-editor](https://github.com/yeole-rohan/ray-content-editor)
* **CDN**: [jsDelivr - rayeditor](https://www.jsdelivr.com/package/npm/rayeditor)

---

Would you like a downloadable `README.md` file generated from this?
