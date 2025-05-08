 // Global variables
 let contacts = [];
 let isEditing = false;
 
 // DOM elements
 // Get the contact form element - used for submitting new contacts and editing existing ones
const contactForm = document.getElementById('contact-form');
// Get the hidden input field that stores the ID of a contact being edited
const contactIdInput = document.getElementById('contact-id');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
// Get the submit button that adds new contacts or updates existing ones
const submitBtn = document.getElementById('submit-btn');
// Get the cancel button that resets the form and exits edit mode
const cancelBtn = document.getElementById('cancel-btn');
// Get the container element that displays the list of contacts
const contactList = document.getElementById('contact-list');
// Get the input field for searching contacts by name or phone number
const searchInput = document.getElementById('search-input');
// Get the button that triggers the contact search functionality
const searchBtn = document.getElementById('search-btn');
// Get the button that clears search results and shows all contacts
const resetSearchBtn = document.getElementById('reset-search-btn');
// Get the notification area for displaying success and error messages
const notification = document.getElementById('notification');
// Get the loading indicator element shown during asynchronous operations
const loading = document.getElementById('loading');
 // Mock API endpoint (we'll simulate this with localStorage)
 const API_URL = 'api/contacts';
 
 // Initialize the application
 document.addEventListener('DOMContentLoaded', () => {
     setupEventListeners();
     loadContacts();
 });
 
 // Setup event listeners
 function setupEventListeners() {
     contactForm.addEventListener('submit', handleFormSubmit);
     cancelBtn.addEventListener('click', resetForm);
     searchBtn.addEventListener('click', searchContacts);
     resetSearchBtn.addEventListener('click', resetSearch);
     searchInput.addEventListener('keyup', (e) => {
         if (e.key === 'Enter') {
             searchContacts();
         }
     });
 }
 
 // Load contacts from localStorage (simulating API fetch)
 async function loadContacts() {
     try {
         // Simulate loading delay on page load/reload
         loading.style.display = 'block';
         
         // Simulate API fetch with localStorage
         await new Promise(resolve => setTimeout(resolve, 500));
         
         const storedContacts = localStorage.getItem('phonebook-contacts');
         contacts = storedContacts ? JSON.parse(storedContacts) : [];
         
         renderContacts(contacts);
         loading.style.display = 'none';
     } catch (error) {
         showNotification('Error loading contacts', 'error');
         loading.style.display = 'none';
     }
 }
 
 // Save contacts to localStorage (simulating API post/put)
 async function saveContacts() {
     try {
         // Simulate API latency
         await new Promise(resolve => setTimeout(resolve, 300));
         localStorage.setItem('phonebook-contacts', JSON.stringify(contacts));
         return true;
     } catch (error) {
         showNotification('Error saving contacts', 'error');
         return false;
     }
 }
 
 // Handle form submission (add or update contact)
 async function handleFormSubmit(e) {
     e.preventDefault();
     
     const contactData = {
         name: nameInput.value.trim(),
         phone: phoneInput.value.trim(),
         email: emailInput.value.trim()
     };
     
     // Validate inputs
     if (!contactData.name || !contactData.phone) {
         showNotification('Name and phone number are required', 'error');
         return;
     }
     
     try {
         if (isEditing) {
             // Update existing contact
             const contactId = contactIdInput.value;
             const contactIndex = contacts.findIndex(c => c.id === contactId);
             
             if (contactIndex !== -1) {
                 contacts[contactIndex] = {
                     ...contacts[contactIndex],
                     ...contactData
                 };
                 
                 const success = await saveContacts();
                 if (success) {
                     showNotification('Contact updated successfully', 'success');
                     renderContacts(contacts);
                     resetForm();
                 }
             }
         } else {
             // Add new contact
             const newContact = {
                 id: Date.now().toString(),
                 ...contactData
             };
             
             contacts.push(newContact);
             const success = await saveContacts();
             
             if (success) {
                 showNotification('Contact added successfully', 'success');
                 renderContacts(contacts);
                 resetForm();
             }
         }
     } catch (error) {
         showNotification('Error processing your request', 'error');
     }
 }
 
 // Display contacts in the list
 function renderContacts(contactsToRender) {
     contactList.innerHTML = '';
     
     if (contactsToRender.length === 0) {
         contactList.innerHTML = '<div class="no-contacts">No contacts found</div>';
         return;
     }
     
     contactsToRender.forEach(contact => {
         const contactItem = document.createElement('li');
         contactItem.className = 'contact-item';
         contactItem.innerHTML = `
             <div class="contact-info">
                 <h3>${contact.name}</h3>
                 <p>📞 ${contact.phone}</p>
                 ${contact.email ? `<p>✉️ ${contact.email}</p>` : ''}
             </div>
             <div class="contact-actions">
                 <button class="edit-btn" data-id="${contact.id}">Edit</button>
                 <button class="delete-btn" data-id="${contact.id}">Delete</button>
             </div>
         `;
         
         contactList.appendChild(contactItem);
         
         // Add event listeners for edit and delete buttons
         contactItem.querySelector('.edit-btn').addEventListener('click', () => editContact(contact.id));
         contactItem.querySelector('.delete-btn').addEventListener('click', () => deleteContact(contact.id));
     });
 }
 
 // Edit contact
 function editContact(contactId) {
     const contact = contacts.find(c => c.id === contactId);
     
     if (contact) {
         // Populate form with contact details
         contactIdInput.value = contact.id;
         nameInput.value = contact.name;
         phoneInput.value = contact.phone;
         emailInput.value = contact.email || '';
         
         // Update UI to reflect editing mode
         submitBtn.textContent = 'Update Contact';
         cancelBtn.style.display = 'inline-block';
         isEditing = true;
         
         // Scroll to form
         document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
     }
 }
 
 // Delete contact
 async function deleteContact(contactId) {
     if (confirm('Are you sure you want to delete this contact?')) {
         try {
             const contactIndex = contacts.findIndex(c => c.id === contactId);
             
             if (contactIndex !== -1) {
                 contacts.splice(contactIndex, 1);
                 const success = await saveContacts();
                 
                 if (success) {
                     showNotification('Contact deleted successfully', 'success');
                     renderContacts(contacts);
                     
                     // If the deleted contact was being edited, reset the form
                     if (isEditing && contactIdInput.value === contactId) {
                         resetForm();
                     }
                 }
             }
         } catch (error) {
             showNotification('Error deleting contact', 'error');
         }
     }
 }
 
 // Search contacts
 function searchContacts() {
     const searchTerm = searchInput.value.trim().toLowerCase();
     
     if (!searchTerm) {
         renderContacts(contacts);
         return;
     }
     
     const filteredContacts = contacts.filter(contact => 
         contact.name.toLowerCase().includes(searchTerm) || 
         contact.phone.toLowerCase().includes(searchTerm) ||
         (contact.email && contact.email.toLowerCase().includes(searchTerm))
     );
     
     renderContacts(filteredContacts);
 }
 
 // Reset search and show all contacts
 function resetSearch() {
     searchInput.value = '';
     renderContacts(contacts);
 }
 
 // Reset form and exit editing mode
 function resetForm() {
     contactForm.reset();
     contactIdInput.value = '';
     submitBtn.textContent = 'Add Contact';
     cancelBtn.style.display = 'none';
     isEditing = false;
 }
 
 // Display notification message
 function showNotification(message, type) {
     notification.textContent = message;
     notification.className = `notification ${type}`;
     notification.style.display = 'block';
     
     // Auto-hide after 3 seconds
     setTimeout(() => {
         notification.style.display = 'none';
     }, 3000);
 }