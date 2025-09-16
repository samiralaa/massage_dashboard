<template>
  <div class="otp-wrapper">
    <div class="otp-container">
      <img src="@/assets/images/EleganceLogo.png" alt="Logo" height="100" />
      <p class="otp-message">{{ $t('otp.message') }}</p>
      <span>{{ user.email }}</span>

      <form @submit.prevent="handleOtpVerification">
        <div class="otp-input-group" dir="ltr">
          <input v-for="i in 4" :key="i" type="text" inputmode="numeric" maxlength="1" pattern="[0-9]*"
            v-model="otp[i - 1]" @input="handleInput($event, i)" @keydown="handleKeyDown($event, i)" class="otp-input"
            placeholder="_" />
        </div>
        <button type="submit" :disabled="!isOtpComplete" class="verify-btn">{{ $t('otp.verify') }}</button>
        <div v-if="otpMessage" class="info-message" :style="{ marginTop: '1rem', color: otpMessageColor }">{{ otpMessage
          }}</div>
      </form>

      <div class="resend d-flex w-100 justify-content-between align-items-center mt-3">
        <div class="time-left">
          <span>{{ timer }}</span>
        </div>
        <button class="btn btn-link" :disabled="timer !== '00:00'" @click.prevent="resendOtp">
          <fa icon="rotate-right" />
          {{ $t('otp.resend') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const API_URL = 'https://massagebackend.webenia.org/api'

export default {
  data() {
    return {
      otp: Array(4).fill(''),
      user: null,
      token: null,
      timer: '03:00',
      countdown: null,
      otpMessage: ''
    }
  },
  computed: {
    otpMessageColor() {
      if (this.otpMessage === 'Invalid OTP' || this.otpMessage === 'Resend Invalid') {
        return 'red';
      }
      if (this.otpMessage === 'OTP resent successfully') {
        return 'green';
      }
      return '#333';
    },
    isOtpComplete() {
      return this.otp.every(digit => /^\d$/.test(digit))
    }
  },
  created() {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('auth_token')

    if (!userData || !token) {
      this.$router.push('/register')
      return
    }

    this.user = JSON.parse(userData)
    this.token = token

    this.startTimer()
    localStorage.removeItem('user');

  },
  methods: {
    focusNext(index) {
      if (index < 4 && this.otp[index - 1]) {
        this.$el.querySelectorAll('.otp-input')[index].focus()
      }
    },
    handleInput(event, index) {
      const value = event.target.value

      // لو المستخدم كتب رقم
      if (/^\d$/.test(value)) {
        this.otp[index - 1] = value
        if (index < 4) {
          this.focusNext(index)
        }
      } else {
        // امسح أي قيمة غير رقم
        this.otp[index - 1] = ''
      }
    },
    handleKeyDown(event, index) {
      if (event.key === 'Backspace' && !this.otp[index - 1] && index > 1) {
        this.$el.querySelectorAll('.otp-input')[index - 2].focus()
      }
    },
    async handleOtpVerification() {
      const code = this.otp.join('');
      try {
        const response = await axios.post(`https://massagebackend.webenia.org/api/client/verify-otp`, {
          email: this.user.email,
          otp: code
        }, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });

        const userData = response.data.data;

        if (userData.token && userData.user) {
          localStorage.setItem('auth_token', userData.token);
          localStorage.setItem('auth_user', JSON.stringify(userData.user));

          this.$store.commit('auth/SET_AUTH', userData);
          await this.$store.dispatch('cart/loadCart');

          this.$router.push('/');
        } else {
          this.otpMessage = response.data.message || 'Verification failed.';
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Invalid OTP';
        this.otpMessage = msg;
        this.$toast?.error?.(msg);
      }
    },

    startTimer() {
      let minutes = 3
      let seconds = 0

      this.countdown = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(this.countdown)
            return
          }
          minutes--
          seconds = 59
        } else {
          seconds--
        }

        this.timer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      }, 1000)
    },
    async resendOtp() {
      try {
        const response = await axios.post(`${API_URL}/resend-otp`, {
          email: this.user.email
        });
        if (response.data.status === true) {
          const msg = response.data.message || 'OTP resent successfully.';
          this.otpMessage = msg;
          this.$toast?.info?.(msg);
        } else {
          const msg = response.data.message || 'Resend Invalid';
          this.otpMessage = msg;
          this.$toast?.error?.(msg);
        }
        this.startTimer();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Resend Invalid';
        this.otpMessage = errorMessage;
        this.$toast?.error?.(errorMessage);
      }
    }
  }
}
</script>

<style scoped>
.otp-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.otp-container {
  width: fit-content;
  margin: 2rem auto;
  padding: 2rem;
  text-align: center;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.otp-message {
  font-weight: bold;
  color: #333;
  margin-bottom: 0;
}

.otp-container span {
  font-weight: bold;
  color: #7f7f7f;
  margin-bottom: 0px;
}

.otp-input-group {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin: 2rem 0;
}

.otp-input {
  width: 40px;
  height: 40px;
  text-align: center;
  font-size: 1.2rem;
  background-color: #7c7c7c54;
  border: 0px;
  border-radius: 4px;
}

.otp-input::-webkit-outer-spin-button,
.otp-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.otp-input::placeholder {
  color: #333;
  font-weight: bold;
}

.otp-input:focus {
  border-color: #725932;
  background-color: #8b6a3d5b;
  outline: none;
  box-shadow: 0 0 0 2px rgba(139, 107, 61, 0.2);
}

.verify-btn {
  background-color: #8B6B3D;
  color: white;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  transition: background-color 0.3s;
}

.verify-btn:hover {
  background-color: #725932;
}

.verify-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.resend {
  padding: 0 100px;
  font-weight: bold;
}

.resend button {
  color: #7f7f7f;
  text-decoration: none;
  font-weight: bold;
}

.resend button:disabled {
  color: #ccc;
  pointer-events: visible;
  cursor: not-allowed;
}

.time-left {
  font-size: 0.9rem;
  color: #7f7f7f;
}
</style>
