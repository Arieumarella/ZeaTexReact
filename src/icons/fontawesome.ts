// src/icons/fontawesome.ts
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus, faTrash, faEdit, faSearch, faDownload, faFileAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

// Add commonly used icons to the library
library.add(faPlus, faTrash, faEdit, faSearch, faDownload, faFileAlt, faSpinner, fab);

export default library;
