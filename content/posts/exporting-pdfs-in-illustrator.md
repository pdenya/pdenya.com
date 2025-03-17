---
author: Paul
category:
  - illustrator
date: "2013-07-18T22:10:39+00:00"
guid: https://pdenya.com/?p=89
title: Exporting PDFs in Illustrator
url: /2013/07/18/exporting-pdfs-in-illustrator/

---
There are a few common issues with saving PDFs in Adobe Illustrator. I experienced these with CS5 (5.1 specifically) but while looking for a fix I saw reports of the same errors from users with CS2, CS3, CS4, and CS6 as well. Commond errors include:

- "This file cannot be found." when trying to save a PDF in Illustrator
- Saved PDFs coming out blank white or empty with file sizes 500k+

## This file cannot be found

![illustrator_cannot_be_found](/wp-content/uploads/2013/07/illustrator_cannot_be_found.png)

I didn't discover the root cause of this error but it may have been something malformed in the PDF file. I found two possible workarounds for this and strangely each worked a different time.

### Re-save with Preview

1. Close the PDF in Illustrator and Open it in Preview
1. Add a blank text area or some other unseen modification
1. Save in Preview
1. Re-open in Illustrator, modify, and save as PDF

### Save as a different file type

1. Save the PDF as a different type (eg: ai)
1. Close and reopen the file
1. Save as PDF

## Saved PDF is blank

Try saving with these settings. Compatibility and Options are the keys here, leave all other panels as defaults.

![illustrator_options](/wp-content/uploads/2013/07/illustrator_options1.png)

This means no compression from Illustrator so you'll get a pretty big file. If it's text heavy like most PDFs are you might benefit from compressing it with preview.

1. Open in preview
1. File > Export...
1. Quartz Filter: Reduce File Size
1. Save

![illustrator_preview_options](/wp-content/uploads/2013/07/illustrator_preview_options.png)
