/**
 * This script is triggered on Google Form submission. It reads a "Unit Number" 
 * from the response, creates a subfolder for that unit if one doesn't exist, 
 * and then moves, renames (with a timestamp), and adds metadata to any file uploads.
 *
 * @param {Object} e The event object passed by the "On form submit" trigger.
 */
function processFormAttachments(e) {
  // --- Configuration Constants ---
  // !!! IMPORTANT !!! This title must exactly match the question in your Google Form.
  const UNIT_NUMBER_QUESTION_TITLE = 'Unit Number';
  const DEFAULT_FOLDER_NAME = 'Unsorted';
  const INVALID_FOLDER_NAME = 'Invalid_Unit_Number';

  try {
    if (!e || !e.response) {
      Logger.log('Script run without a form submission event.');
      return;
    }

    const formResponse = e.response;
    const respondentEmail = formResponse.getRespondentEmail();

    if (!respondentEmail) {
      Logger.log('Could not get respondent email. Ensure form is set to collect email addresses.');
      return;
    }

    const submissionDate = formResponse.getTimestamp();
    const formattedFilenameTimestamp = Utilities.formatDate(submissionDate, Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss');
    const formattedReadableTimestamp = Utilities.formatDate(submissionDate, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

    const itemResponses = formResponse.getItemResponses();
    let unitNumber = '';
    
    for (const itemResponse of itemResponses) {
      if (itemResponse.getItem().getTitle() === UNIT_NUMBER_QUESTION_TITLE) {
        unitNumber = itemResponse.getResponse();
        break; 
      }
    }

    if (!unitNumber) {
      Logger.log(`Response for "${UNIT_NUMBER_QUESTION_TITLE}" was empty. Using default folder.`);
      unitNumber = DEFAULT_FOLDER_NAME;
    }

    let folderName = unitNumber.toString().replace(/[\\/:"*?<>|]/g, '').trim();
    if (!folderName) {
        Logger.log('Unit Number resulted in an invalid folder name. Using "Invalid_Unit_Number".');
        folderName = INVALID_FOLDER_NAME;
    }

    Logger.log(`Processing response from: ${respondentEmail} at ${formattedReadableTimestamp} for Unit Folder: "${folderName}"`);

    for (const itemResponse of itemResponses) {
      if (itemResponse.getItem().getType() === FormApp.ItemType.FILE_UPLOAD) {
        const fileIds = itemResponse.getResponse();

        if (fileIds && fileIds.length > 0) {
          const firstFile = DriveApp.getFileById(fileIds[0]);
          const mainAttachmentFolder = firstFile.getParents().next();

          let unitSubfolder;
          const existingFolders = mainAttachmentFolder.getFoldersByName(folderName);

          if (existingFolders.hasNext()) {
            unitSubfolder = existingFolders.next();
          } else {
            unitSubfolder = mainAttachmentFolder.createFolder(folderName);
            Logger.log(`Created new subfolder: "${folderName}"`);
          }

          fileIds.forEach((fileId, index) => {
            const file = DriveApp.getFileById(fileId);
            const originalFilename = file.getName();
            
            file.moveTo(unitSubfolder);

            const newFilename = `${respondentEmail}_${formattedFilenameTimestamp}_${index > 0 ? (index + '_') : ''}${originalFilename}`;
            const metadata = `File uploaded by: ${respondentEmail}\nSubmission Timestamp: ${formattedReadableTimestamp}\nOriginal Filename: ${originalFilename}\nUnit: ${folderName}`;

            file.setName(newFilename);
            file.setDescription(metadata);

            Logger.log(`Processed file: "${originalFilename}" -> Moved to "${folderName}", renamed to "${newFilename}".`);
          });
        }
      }
    }
  } catch (error) {
    Logger.log(`An error occurred: ${error.toString()}\nStack: ${error.stack}`);
  }
}
