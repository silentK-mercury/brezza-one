
````
# Google Form Attachment Processor & Sorter

## Overview

This Google Apps Script automates the processing of file attachments submitted through a Google Form. When a user submits a response with attachments, this script automatically organizes the files into designated subfolders within Google Drive, renames them with a consistent naming convention, and adds useful metadata to the file's description.

This is ideal for managing submissions like maintenance requests, user reports, or any process where files need to be sorted based on a specific piece of information from the form (e.g., a unit number, a client name, or a project ID).

## Features

* **Automatic File Sorting:** Creates subfolders based on a specific answer in the form (e.g., "Unit 101", "Unit 205").
* **Smart Renaming:** Renames uploaded files using a clear and consistent format: `[Respondent's Email]_[YYYY-MM-DD_HH-mm-ss]_[Original Filename]`.
* **Timestamping:** Includes a precise timestamp in the filename to ensure every file is unique and to prevent conflicts.
* **Metadata Injection:** Adds key information to each file's description in Google Drive, including the submitter's email, submission timestamp, original filename, and the unit number it belongs to.
* **Error Handling:** Logs any issues encountered during execution for easy troubleshooting.
* **Default Folder:** Places files into an "Unsorted" folder if the sorting question is left blank by the user.

## Prerequisites

1.  A Google Form that is configured to accept file uploads.
2.  Your Google Form settings must be configured to **Collect email addresses**. This can be found in the `Settings` tab of your form.
3.  Your form must include a question to be used for sorting (e.g., a "Short answer" question titled "Unit Number").

## Setup Instructions

To use this script, it **must be attached directly to your Google Form**.

1.  **Open the Script Editor:**
    * Open your Google Form.
    * Click the **More** icon (three vertical dots) in the top-right corner.
    * Select **Script editor**. This will open a new Apps Script project bound to the form.

2.  **Add the Script Code:**
    * Delete any default code in the editor (e.g., `function myFunction() {}`).
    * Copy the script code that was provided and paste it into the editor.
    * Click the **Save project** icon (floppy disk).

3.  **Create the Trigger:**
    * In the script editor, click the **Triggers** icon (clock) on the left sidebar.
    * Click the **+ Add Trigger** button in the bottom-right.
    * Configure the trigger with these exact settings:
        * **Choose which function to run:** `processFormAttachments`
        * **Choose which deployment should run:** `Head`
        * **Select event source:** `From form`
        * **Select event type:** `On form submit`
    * Click **Save**.

4.  **Authorize Permissions:**
    * Google will prompt you to authorize the script. Choose your Google account.
    * You may see a warning screen. Click **Advanced**, then click **"Go to [Your Project Name] (unsafe)"**.
    * Review the permissions the script needs (to manage your Drive files and Forms) and click **Allow**.

The setup is now complete. The script will run automatically for every new form submission.

## Configuration

The script can be easily configured by changing the constants at the top of the file.

* `UNIT_NUMBER_QUESTION_TITLE`: This is the most important setting. **You must change this value to exactly match the title of the question in your form that you want to use for sorting folders.**

    ```javascript
    // Example: If your question is "What is your department?", change it to:
    const UNIT_NUMBER_QUESTION_TITLE = 'What is your department?';
    ```

## How It Works

1.  The script is activated by the `On form submit` trigger.
2.  It retrieves the respondent's email and the submission timestamp.
3.  It reads all the answers from the form to find the response for the question matching `UNIT_NUMBER_QUESTION_TITLE`.
4.  For each file upload question, it finds the parent folder in Google Drive where the form is storing the attachments.
5.  It checks if a subfolder with the unit number (e.g., "Unit 101") already exists. If not, it creates it.
6.  It moves each uploaded file into the correct subfolder.
7.  Finally, it renames the file and sets its description with the collected metadata.

## Troubleshooting

* **Files are not being sorted or renamed:**
    * The most common cause is that the script was run manually from the editor, which results in the log message: `Script run without a form submission event.` **The script only works when triggered by a real form submission.**
    * Check the **Executions** tab in the script editor for any runs that failed. Click on them to see the error messages.
    * Ensure the trigger is set up correctly (see Step 3). If you are unsure, delete the trigger and create it again.
    * Verify that the value of `UNIT_NUMBER_QUESTION_TITLE` in the script is an **exact match** for the question title in your form.

````
