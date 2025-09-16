<template>
  <section class="why-choose-us">
    <div class="container">
      <div class="title mt-5">
        <fa class="fa-icon" :icon="['fas', 'shopping-basket']" />
        <h2>{{ $t('home.why-us') }}</h2>
      </div>
      <div
        class="row row-cols-xl-5 row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-1 row--20 d-flex justify-content-around"
      >
        <div class="col">
          <div class="service-box card">
            <div class="icon">
              <img src="@/assets/images/WhyChooseUs/3.png" class="img-fluid" alt="Service" />
            </div>
            <h6 class="title">{{ $t('home.why.fast_delivery') }}</h6>
          </div>
        </div>
        <div class="col">
          <div class="service-box card">
            <div class="icon">
              <img src="@/assets/images/WhyChooseUs/2.png" class="img-fluid" alt="Service" />
            </div>
            <h6 class="title">{{ $t('home.why.guarantee') }}</h6>
          </div>
        </div>
        <div class="col">
          <div class="service-box card">
            <div class="icon">
              <img src="@/assets/images/WhyChooseUs/icon 1 .png" class="img-fluid" alt="Service" />
            </div>
            <h6 class="title">{{ $t('home.why.return_policy') }}</h6>
          </div>
        </div>
        <div class="col">
          <div class="service-box card">
            <div class="icon">
              <img src="@/assets/images/WhyChooseUs/4.png" class="img-fluid" alt="Service" />
            </div>
            <h6 class="title">{{ $t('home.why.pro_quality') }}</h6>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="axil-poster mt-3">
    <div class="container">
      <div class="row">
        <div class="col-lg-6 mb--30">
          <div class="single-poster">
            <a>
              <img src="@/assets/images/offers/Elegancewebsiteleft.png" />
            </a>
          </div>
        </div>
        <div class="col-lg-6 mb--30">
          <div class="single-poster">
            <a>
              <img src="@/assets/images/offers/Elegancewebsiteright.png" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
    name: "WhyChooseUs",
    data() {
        return {
        };
    },
};
</script>

<style scoped>
/* .why-choose-us {
    padding: 50px 20px;
    background-color: #f9f9f9;
    text-align: center;
}
.section-title {
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: #333;
}
.section-description {
    font-size: 1.2rem;
    margin-bottom: 40px;
    color: #666;
}
.features {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
}
.feature {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    width: 300px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
}
.icon {
    font-size: 2rem;
    color: #007bff;
    margin-bottom: 15px;
}
.feature-title {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #333;
}
.feature-description {
    font-size: 1rem;
    color: #666;
} */

/* new */
.title{
    margin-bottom: 15px;
    color: #8b6b3d;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
}

.fa-icon{
    font-size: 1.8rem;
    margin-bottom: 8px;
}
.service-box{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1/1;
    text-align: center;
    border: solid 1px #f1f1f1 !important;
    gap: 20px;
    transition: all 0.2s ease-in;
}
.icon{
    margin-top: 30px;
    width: 40%;
    height: 40%;
}
.service-box:hover{
    border: none;
    box-shadow: 0 10px 20px #2334de1a;
    transform: scale(1.05);
    transform: translateY(-10px);
}
.single-poster{
    position: relative;
    overflow: hidden;
    border-radius: 0.5rem;
    margin-bottom: 30px;
}
.single-poster img{
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.2s ease-in-out;
}
.single-poster:hover img{
    scale: 1.1;
}
</style>