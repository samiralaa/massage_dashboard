<template>
  <Header/>
  <div class="contact-us">
    <div class="container">
      <div class="title">
          <div class="container">
              <h2>{{ $t('contact.title') }}</h2>
          </div>
      </div>

      <div class="container">
       <div class="row">
        <div class=" col-12 col-md-6" :dir="direction">
          <div class="content-info">
            <h2>{{ $t('contact.subtitle') }}</h2>
            <p>{{ $t('contact.description') }}</p>
          </div>
          <div class="content-info">
            <h5>{{ $t('contact.ourStore.title') }}:</h5>
            <div class="info">
              <fa icon="location-dot" class="icon" />
              <a href="https://www.google.com/maps/place/37+%D8%B4%D8%A7%D8%B1%D8%B9+%D9%83%D9%92%D9%88%D9%8E%D8%A7%D8%B1+-+%D8%A2%D9%84+%D9%86%D9%87%D9%8A%D8%A7%D9%86+-+Zone+1+-+%D8%A3%D8%A8%D9%88+%D8%B8%D8%A8%D9%8A%E2%80%AD/@24.46297,54.383641,16z/data=!4m6!3m5!1s0x3e5e6629e81bf275:0xe4551295f406885e!8m2!3d24.4629696!4d54.3836411!16s%2Fg%2F11f6xf4mf4?hl=ar&entry=ttu&g_ep=EgoyMDI1MDUwNS4wIKXMDSoASAFQAw%3D%3D">
                {{ $t('contact.ourStore.address1') }} <br>
                {{ $t('contact.ourStore.address2') }}
              </a>
            </div>
          </div>  
          <div class="content-info">
            <h5>{{ $t('contact.workingHours.title') }}:</h5>
            <div class="info" >
              <fa icon="clock" class="icon" />
              <p  >{{ $t('contact.workingHours.from') }} <span >10:00 AM </span> {{ $t('contact.workingHours.to') }} <span>10:00 PM</span></p>
            </div>
          </div>  
          <div class="content-info">
            <h5>{{ $t('contact.title') }}:</h5>
            <div class="info">
              <fa icon="envelope" class="icon" />
              <a href="mailto:Eleganceoud22@gmail.com">Eleganceoud22@gmail.com</a>
            </div>
            <div class="info" >
              <fa icon="fab fa-whatsapp" class="icon" />
              <a href="https://wa.me/971544887138" dir="ltr">+971 54 488 7138</a>
            </div>
          </div>  
        </div>

         <div class="col-12 col-md-6 col-lg-6 contact-form" :dir="direction">
        <form @submit.prevent="handleSubmit" class="">
          <div class="">
            <div class="form-group">
              <label for="name">
                {{ $t('contact.name') }}
              </label>
              <input v-model="contactForm.name" type="text" id="name" :placeholder="$t('contact.namePlaceholder')"  />
            </div>
            <div class="form-group">
              <label for="email">
                {{ $t('contact.email') }}
              </label>
              <input v-model="contactForm.email" type="email" id="email" :placeholder="$t('contact.emailPlacehodler')"  />
            </div>
            <div class="form-group">
              <label for="subject">
                {{ $t('contact.subject') }}
              </label>
              <input v-model="contactForm.subject" type="text" id="subject" :placeholder="$t('contact.subjectPlaceholder')"  />
            </div>
            <div class="form-group">
              <label for="message">
                {{ $t('contact.message') }}
              </label>
              <textarea v-model="contactForm.message" id="message" rows="5" :placeholder="$t('contact.messagePlaceholder')" ></textarea>
            </div>
            <div class="submit-btn">
              <button class="btn" type="submit" :disabled="loading">
                <span v-if="loading">{{ $t('contact.sending') }}</span>
                <span v-else>{{ $t('contact.sendMessage') }}</span>
              </button>
            </div>
            <p v-if="success" class="success">
              {{ $t('contact.successMessage') }}
            </p>
            <p v-if="error" class="error">{{ error }}</p>
          </div>
        </form>
        </div>
        </div>
      </div>

      <div class="contact-footer mb-5">
        <div class="content-info col-md-12 col-lg-6">

        </div>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3631.6485909291746!2d54.386216025984375!3d24.462974461050244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5e6629e81bf275%3A0xe4551295f406885e!2zMzcg2LTYp9ix2Lkg2YPZktmI2Y7Yp9ixIC0g2KLZhCDZhtmH2YrYp9mGIC0gWm9uZSAxIC0g2KPYqNmIINi42KjZig!5e0!3m2!1sar!2sae!4v1723272974133!5m2!1sar!2sae" frameborder="0" width="100%" height="500"></iframe>
      </div>
    </div>
  </div>
  <Footer/>
</template>

<script>
  import Header from '@/components/Website/Header.vue'
  import i18n from '@/i18n.js'
  import Footer from '@/components/Website/Footer.vue' 
  import { ref } from 'vue'
  import axios from 'axios'
  import { ElNotification } from 'element-plus'

export default {
  name: 'ContactUs',
  components: {
    Header,
    Footer,
  },
  computed: {
    direction() {
   
    
      return i18n.global.locale.value === 'ar' ? 'rtl' : 'ltr';
    }
  },
  data() {
    return {
      contactForm: {
        name: '',
        email: '',
        subject: '',
        message: ''
      },
      loading: false,
      success: false,
      error: null
    }
  },
  methods: {
    validateForm() {
      if (!this.contactForm.name.trim()) {
        this.error = this.$t ? this.$t('contact.nameRequired') : 'Name is required.';
        return false;
      }
      if (/^\d+$/.test(this.contactForm.name.trim())) {
        this.error = this.$t ? this.$t('contact.nameNotNumber') : 'Name cannot be only numbers.';
        return false;
      }
      if (!this.contactForm.email.trim()) {
        this.error = this.$t ? this.$t('contact.emailRequired') : 'Email is required.';
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.contactForm.email)) {
        this.error = this.$t ? this.$t('contact.emailInvalid') : 'Invalid email address.';
        return false;
      }
      if (!this.contactForm.subject.trim()) {
        this.error = this.$t ? this.$t('contact.subjectRequired') : 'Subject is required.';
        return false;
      }
      if (!this.contactForm.message.trim()) {
        this.error = this.$t ? this.$t('contact.messageRequired') : 'Message is required.';
        return false;
      }
      this.error = null;
      return true;
    },
    async handleSubmit() {
      this.success = false;
      this.error = null;
      if (!this.validateForm()) {
        return;
      }
      this.loading = true;
      try {
        const response = await axios.post('/api/contact', this.contactForm, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        ElNotification.success('Message sent successfully!');
        this.contactForm = { name: '', email: '', subject: '', message: '' };
        this.success = true;
      } catch (e) {
        this.error = 'Failed to send message.';
        console.error('Contact form error:', e);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.contact-form {
  background: #f8f8f8;
  padding: 2rem 3rem;
  border-radius: 10px;
}
.title {
    margin-top: 30px;
    color: #8b6b3d;
}
.form-group {
  display: flex;
  flex-direction: column;
}
label {
  font-weight: bold;
}
input, textarea {
  padding: 0.5rem;
  background-color: #ececec;
  border: none;
  min-height: 40px;
  border-radius: 4px;
  margin-bottom: 1rem;
}
.submit-btn {
  display: flex;
  justify-content: end;
}
button {
  position: relative;
  padding: 0.75rem 1.5rem;
  color: #8b6b3d;
  background-color: #f9f9f9;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  width: fit-content;
  overflow: hidden;
  z-index: 0;
  border-radius: 0;
}

button::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #8b6b3d;
  transition: height 0.3s ease;
  z-index: -1;
}

button:hover {
  color: #fff;
  border-radius: 6px;
}

button:hover::before {
  height: 100%;

}

button:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}

.success {
  color: green;
}
.error {
  color: red;
}
.contact-body {
  margin-top: 0 2rem;
  padding: 0 1rem;
  border-radius: 6px;
  width: 100%;
}
.contact-container {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  gap: 2rem;
}
.content-info{
  margin: 2rem 0;
}
.content-info h5{
  text-align: start;
}
.content-info p{
    color: #7c7c7c;
    margin: 0;
}
.content-info span{
  color: #8b6b3d;
  font-weight: 600;
}
.info{
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.5rem 0;
}
.info a {
  color: #7c7c7c;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s ease;
}
.info a:hover {
  color: #8b6b3d;
  cursor: pointer;
}
.icon {
  font-size: 1.5rem;
  color: #8b6b3d;
}
.contact-footer iframe {
  border-radius: 10px;
  width: 100%;
  height: 500px;
}
</style>