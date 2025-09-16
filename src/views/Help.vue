<template>
  <div class="help-page">
    <div class="container">
      <h1 class="page-title">Help & Support</h1>
      
      <div class="help-card">
        <div class="help-content">
          <div class="help-section">
            <h2>Frequently Asked Questions</h2>
            
            <div class="faq-item" v-for="(faq, index) in faqs" :key="index">
              <div class="faq-question" @click="toggleFaq(index)">
                <h3>{{ faq.question }}</h3>
                <span class="toggle-icon">{{ faq.isOpen ? '−' : '+' }}</span>
              </div>
              <div class="faq-answer" v-if="faq.isOpen">
                <p>{{ faq.answer }}</p>
              </div>
            </div>
          </div>
          
          <div class="help-section">
            <h2>Contact Support</h2>
            <p>Need additional help? Our support team is available to assist you.</p>
            
            <form @submit.prevent="submitSupportRequest" class="support-form">
              <div class="form-group">
                <label for="subject">Subject</label>
                <input type="text" id="subject" v-model="supportRequest.subject" class="form-control" required>
              </div>
              
              <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" v-model="supportRequest.description" class="form-control" rows="5" required></textarea>
              </div>
              
              <div class="form-group">
                <label for="priority">Priority</label>
                <select id="priority" v-model="supportRequest.priority" class="form-control">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
          
         
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'
export default {
  name: 'HelpView',

setup(){
  const store = useStore()
},
  data() {
    return {
      faqs: [
        {
          question:'How do I reset my password?',
          answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page. Follow the instructions sent to your email to create a new password.',
          isOpen: false
        },
        {
          question: 'How do I add a new brand?',
          answer: 'To add a new brand, navigate to the Brands page and click on the "Add New Brand" button. Fill in the required information in the form and submit.',
          isOpen: false
        },
        {
          question: 'Can I export my data?',
          answer: 'Yes, you can export your data in various formats including CSV, Excel, and PDF from most pages that display tabular data. Look for the export button in the table header.',
          isOpen: false
        },
        {
          question: 'How do I update my profile information?',
          answer: 'You can update your profile information by navigating to the Profile page from the dropdown menu in the top-right corner. Edit your information and click "Save Changes".',
          isOpen: false
        },
        {
          question: 'How can I invite new users to the platform?',
          answer: 'Administrators can invite new users from the Settings > Users page. Click on "Invite User" and enter their email address and role.',
          isOpen: false
        }
      ],
      supportRequest: {
        subject: '',
        description: '',
        priority: 'medium'
      }
    }
  },
  
  methods: {
    toggleFaq(index) {
      this.faqs[index].isOpen = !this.faqs[index].isOpen
    },
    submitSupportRequest() {
      // TODO: Implement support request submission
      alert('Your support request has been submitted. We will respond shortly.')
      this.supportRequest = {
        subject: '',
        description: '',
        priority: 'medium'
      }
    }
  }
}
</script>

<style scoped>
.help-page {
  padding: 20px 0;
}

.page-title {
  margin-bottom: 30px;
  font-weight: 600;
}

.help-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
}

.help-content {
  padding: 30px;
}

.help-section {
  margin-bottom: 40px;
}

.help-section h2 {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.faq-item {
  margin-bottom: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.faq-question {
  padding: 15px 20px;
  background-color: #f9f9f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.faq-question h3 {
  margin: 0;
  font-size: 1.1rem;
}

.toggle-icon {
  font-size: 1.5rem;
  font-weight: bold;
}

.faq-answer {
  padding: 15px 20px;
  background-color: #fff;
  border-top: 1px solid #eee;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-control {
  display: block;
  width: 100%;
  padding: 10px 15px;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-actions {
  margin-top: 30px;
}

.btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 10px 20px;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 4px;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
  cursor: pointer;
}

.btn-primary {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  color: #fff;
  background-color: #0069d9;
  border-color: #0062cc;
}

.doc-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.doc-link {
  display: flex;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.doc-link:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #ddd;
}

.doc-icon {
  font-size: 2rem;
  margin-right: 15px;
  display: flex;
  align-items: center;
}

.doc-info h4 {
  margin: 0 0 5px;
  color: #007bff;
}

.doc-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
}
</style> 