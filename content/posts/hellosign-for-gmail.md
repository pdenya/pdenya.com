---
author: Paul
category:
  - work
date: "2013-08-06T19:24:54+00:00"
guid: https://pdenya.com/?p=239
title: HelloSign for Gmail
url: /2013/08/06/hellosign-for-gmail/

---
HelloSign for Gmail is a browser extension for Chrome, FireFox and Safari that lets users fill out and sign documents without ever leaving Gmail.

The user clicks the sign button next to an attachment and the file is uploaded to HelloSign and the HelloSign editor is opened in a lightbox for the user to sign and make annotations. When the user clicks Continue the iframe closes, a compose window opens in Gmail (as if the user had clicked reply) and the signed document is attached, ready to be sent.

It shortens the process of:

- Download document from Gmail
- Open HelloSign
- Upload document
- Annotate and sign
- Download from HelloSign
- Upload to Gmail
- Send email with signed file attached

to:

- Open in HelloSign for Gmail
- Annotate and sign
- Send email with signed file attached

## Walk through

After installing the extension at [hellosign.com/gmail](http://hellosign.com/gmail) users are directed to Gmail and sent a sample document.

[![0_landing](/wp-content/uploads/2013/08/0_landing.png)](http://hellosign.com/gmail)

### The Sign link we added next to View and Download

![1_sign_link](/wp-content/uploads/2013/08/1_sign_link1.png)

### The Editor

After clicking the sign link the HelloSign editor opens over Gmail and loads the document.

![2_editor](/wp-content/uploads/2013/08/2_editor.png)

### Converting and Attaching

When clicking "Attach to Email" the document is converted into a PDF..

![3_loading](/wp-content/uploads/2013/08/3_loading.png)

..and attached to your email

![4_attached](/wp-content/uploads/2013/08/4_attached1.png)

## Challenges

Even after years of Javascript, I learned a lot about cross domain issues while building this extension but the main challenge was getting the document to upload to Gmail, and probably not for the reasons you're thinking. Actually tricking a general HTML form isn't that difficult, for the most part you can replace an <input type="file" /> with a Blob and have things work correctly. Gmail however retains a reference to the original <input type="file" /> that it creates inside a closure so we had to override some methods like document.createElement to get things working.

It took weeks to build and it was a lot of fun. Probably my favorite project I've worked on at HelloSign, even more so than the iOS app.

## Parades and Accolades

We've heard from tons of people about how much they like the new extension and it's been written up by a few high profile sites including [Forbes](http://www.forbes.com/sites/deborahsweeney/2013/01/17/signed-sealed-delivered-how-hellosign-is-changing-electronic-document-signatures/) and [LifeHacker](http://lifehacker.com/5976527/hellosign-digitally-signs-documents-right-from-gmail).
