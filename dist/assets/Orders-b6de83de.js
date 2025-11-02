import{_ as le,e as u,J as T,f as re,r as i,D as ne,o as c,c as m,a as t,t as o,b as l,w as r,G as de,m as z,i as k,h as p,E as h,K as D,L as ie,F as P,k as j,j as g,M as ce,N as ue,O as pe,P as me}from"./index-8c31c214.js";const he={class:"orders-page"},ge={class:"orders-header"},_e={class:"orders-filters"},fe=["src"],be=["src"],ve=["src"],we={class:"",id:"invoice-print",dir:"ltr"},ye={class:"card p-4"},ke={class:"d-flex justify-content-between align-items-center designInIframe"},De=["src"],$e={class:"row mb-4"},Oe={class:"col-md-6"},Se={class:"mb-0"},Ce={class:"mb-0"},xe={class:"mb-0"},Ee={class:"mb-0"},Ie={class:"mb-0"},Fe={class:"mb-0"},Ve={class:"mb-0"},ze={class:"col-md-6 text-end"},Be={class:"mb-0"},Ae={class:"mb-0"},Me={class:"table table-hover table-bordered"},Ne={class:"text-end"},Le={class:"text-end"},S=5,Te={__name:"Orders",setup(Pe){const C=u([]),v=u(""),w=u(""),x=u(1),E=u(!1),d=u(null),I=u(!1),$=u({Message:"assets/logo2.png",strappi:"assets/strappi.png",tabby:"assets/tabby.png",cash:"assets/cash.png"}),J=["all","pending","accepted","completed","cancelled"],O=async()=>{I.value=!0;try{const a=JSON.parse(localStorage.getItem("tokenData"));if(!a||!a.token)throw new Error("Authentication token not found");p.defaults.headers.common.Authorization=`Bearer ${a.token}`;const e=await p.get("https://massagebackend.webenia.org/api/orders");if(e.data.status===!0)C.value=e.data.data,console.log("Fetched Orders:",C.value);else throw new Error(e.data.message||"Failed to fetch orders")}catch(a){console.error("Error fetching orders:",a),h.error("Failed to fetch orders")}finally{I.value=!1}},F=T(()=>C.value.filter(a=>{const e=v.value===""||a.id.toString().includes(v.value.toLowerCase())||a.total_price.includes(v.value.toLowerCase()),n=!w.value||a.status===w.value;return w.value==="all"?e:e&&n})),U=T(()=>{const a=(x.value-1)*S,e=a+S;return F.value.slice(a,e)}),W=a=>{x.value=a},Q=a=>{d.value=a,E.value=!0,console.log("Selected Order:",d.value)},q=async a=>{try{const e=JSON.parse(localStorage.getItem("tokenData"));if(!e||!e.token)throw new Error("Authentication token not found");p.defaults.headers.common.Authorization=`Bearer ${e.token}`;const n=await p.get(`https://massagebackend.webenia.org/api/orders/${a.id}/accept`);if(n.data.status===!0)h.success("Order accepted successfully"),await O();else throw new Error(n.data.message||"Failed to accept order")}catch{h.error("Failed to accept order")}},G=async a=>{try{const e=JSON.parse(localStorage.getItem("tokenData"));if(!e||!e.token)throw new Error("Authentication token not found");p.defaults.headers.common.Authorization=`Bearer ${e.token}`;const n=await p.get(`https://massagebackend.webenia.org/api/orders/${a.id}/complete`);if(n.data.status===!0)h.success("Order completed successfully"),await O();else throw new Error(n.data.message||"Failed to complete order")}catch(e){console.error("Error completing order:",e),h.error(e.message||"Failed to complete order")}},H=()=>{const a=document.getElementById("invoice-print"),e=document.createElement("iframe");e.style.position="fixed",e.style.right="0",e.style.bottom="0",e.style.width="0",e.style.height="0",e.style.border="0",document.body.appendChild(e);const n=e.contentWindow.document,V=`
    <style>
      /* Example styles — replace/add your own as needed */
      body {
        font-family: Arial, sans-serif;
        // padding: 20px;
        color: #000;
      }
      .text-end { text-align: right; }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        border: 1px solid #ccc;
         padding: 8px;
      }
      .header, .footer {
        // margin-bottom: 20px;
      }
        .designInIframe{
        display: flex;
        justify-content: space-between;
        align-items: center;
        }
        .row {
        display: flex;
        justify-content: space-between;
        align-items: start;
       
        }
        p{
        margin: 10px;
        
        }
        span{
        font-weight: bold;
        }
        h6{
        margin: 20px 0;
        }
       
    </style>
  `;n.open(),n.write(`
    <html>
      <head>
        <title>Invoice</title>
        ${V}
      </head>
      <body>
        ${a.innerHTML}
      </body>
    </html>
  `),n.close(),e.contentWindow.focus(),e.contentWindow.print()},K=a=>{const e=new Date(a);return e.toLocaleDateString()+" "+e.toLocaleTimeString()},R=a=>({pending:"warning",completed:"info",cancelled:"danger",accepted:"success"})[a.toLowerCase()]||"info",X=async a=>{try{const e=JSON.parse(localStorage.getItem("tokenData"));if(!e||!e.token)throw new Error("Authentication token not found");p.defaults.headers.common.Authorization=`Bearer ${e.token}`;const n=await p.post(`https://massagebackend.webenia.org/api/orders/${a.id}/cancel`);if(n.data.status===!0)h.success("Order cancelled successfully"),await O();else throw new Error(n.data.message||"Failed to cancel order")}catch(e){console.error("Error cancelling order:",e),h.error(e.message||"Failed to cancel order")}};return re(()=>{O()}),(a,e)=>{const n=i("el-icon"),V=i("el-input"),Y=i("el-option"),Z=i("el-select"),_=i("el-table-column"),ee=i("el-tag"),y=i("el-button"),te=i("el-table"),ae=i("el-pagination"),se=i("el-dialog"),oe=ne("loading");return c(),m("div",he,[t("div",ge,[t("h2",null,o(a.$t("orders.myOrders")),1),l(V,{modelValue:v.value,"onUpdate:modelValue":e[0]||(e[0]=s=>v.value=s),placeholder:a.$t("orders.Search-orders"),class:"search-input",clearable:""},{prefix:r(()=>[l(n,null,{default:r(()=>[l(D(ie))]),_:1})]),_:1},8,["modelValue","placeholder"])]),t("div",_e,[l(Z,{modelValue:w.value,"onUpdate:modelValue":e[1]||(e[1]=s=>w.value=s),placeholder:a.$t("orders.Filter-by-Status"),clearable:""},{default:r(()=>[(c(),m(P,null,j(J,s=>l(Y,{key:s,label:s,value:s},null,8,["label","value"])),64))]),_:1},8,["modelValue","placeholder"])]),de((c(),z(te,{data:U.value,id:"orders-table",style:{width:"100%"},class:"orders-table",stripe:"",border:""},{default:r(()=>[l(_,{prop:"id",label:a.$t("orders.orderId"),width:"120"},null,8,["label"]),l(_,{prop:"ordered_at",label:a.$t("orders.orderDate"),width:"180"},{default:r(s=>[g(o(K(s.row.ordered_at)),1)]),_:1},8,["label"]),l(_,{label:a.$t("orders.total"),width:"150"},{default:r(s=>[g(o(s.row.currency)+" "+o(s.row.total_price),1)]),_:1},8,["label"]),l(_,{prop:"status",label:a.$t("orders.status"),width:"150"},{default:r(s=>[l(ee,{type:R(s.row.status)},{default:r(()=>[g(o(s.row.status),1)]),_:2},1032,["type"])]),_:1},8,["label"]),l(_,{prop:"method",label:a.$t("orders.payment-method"),width:"150"},{default:r(s=>[s.row.payment_method==="stripe"?(c(),m("img",{key:0,src:$.value.strappi,alt:"Strappi",width:"20",height:"20"},null,8,fe)):k("",!0),s.row.payment_method==="tabby"?(c(),m("img",{key:1,src:$.value.tabby,alt:"Tabby",width:"20",height:"20"},null,8,be)):k("",!0),s.row.payment_method==="cod"?(c(),m("img",{key:2,src:$.value.cash,alt:"Cash",width:"20",height:"20"},null,8,ve)):k("",!0),g(" "+o(s.row.payment_method),1)]),_:1},8,["label"]),l(_,{label:a.$t("orders.actions"),width:"220",fixed:"right"},{default:r(s=>[l(y,{size:"small",type:"primary",onClick:f=>Q(s.row),circle:""},{default:r(()=>[l(n,null,{default:r(()=>[l(D(ce))]),_:1})]),_:2},1032,["onClick"]),l(y,{size:"small",type:"danger",disabled:s.row.status!=="pending"&&s.row.status!=="processing",onClick:f=>X(s.row),circle:""},{default:r(()=>[l(n,null,{default:r(()=>[l(D(ue))]),_:1})]),_:2},1032,["disabled","onClick"]),l(y,{size:"small",type:"success",onClick:f=>q(s.row),disabled:s.row.status!=="pending",circle:""},{default:r(()=>[l(n,null,{default:r(()=>[l(D(pe))]),_:1})]),_:2},1032,["onClick","disabled"]),l(y,{size:"small",type:"info",onClick:f=>G(s.row),disabled:s.row.status!=="accepted",circle:""},{default:r(()=>[l(n,null,{default:r(()=>[l(D(me))]),_:1})]),_:2},1032,["onClick","disabled"])]),_:1},8,["label"])]),_:1},8,["data"])),[[oe,I.value]]),F.value.length>S?(c(),z(ae,{key:0,class:"pagination",layout:"prev, pager, next","current-page":x.value,"page-size":S,total:F.value.length,onCurrentChange:W},null,8,["current-page","total"])):k("",!0),l(se,{modelValue:E.value,"onUpdate:modelValue":e[2]||(e[2]=s=>E.value=s),id:"order-details-dialog",title:a.$t("orders.orderDetails"),width:"600px"},{footer:r(()=>[d.value?(c(),z(y,{key:0,type:"primary",onClick:H},{default:r(()=>[g(o(a.$t("orders.printInvoice")||"Print Invoice"),1)]),_:1})):k("",!0)]),default:r(()=>{var s,f,B,A,M,N;return[t("div",we,[t("div",ye,[t("div",ke,[t("img",{src:$.value.Message,class:"rounded object-fit-contain",width:"200",height:"100",alt:"hi"},null,8,De),e[3]||(e[3]=t("div",null,[t("h5",null,"Message Perfume"),t("p",{class:"mb-0"},"00971544887138"),t("p",null,"Messageoud22@gmail.com")],-1))]),e[11]||(e[11]=t("hr",null,null,-1)),t("div",$e,[t("div",Oe,[e[4]||(e[4]=t("h6",null,"Billed To:",-1)),t("p",Se,o(d.value.user.name),1),t("p",Ce,o((s=d.value.user.address)==null?void 0:s.street),1),t("p",xe,o((f=d.value.user.address)==null?void 0:f.city),1),t("p",Ee,o((B=d.value.user.address)==null?void 0:B.state),1),t("p",Ie,o((A=d.value.user.address)==null?void 0:A.zip),1),t("p",Fe,o((N=(M=d.value.user.address)==null?void 0:M.country)==null?void 0:N.name_en),1),t("p",Ve,o(d.value.user.email),1),t("p",null,o(d.value.user.phone),1)]),t("div",ze,[e[7]||(e[7]=t("h6",null,"Invoice Details:",-1)),t("p",Be,[e[5]||(e[5]=t("span",{class:"fw-bold"},"Invoice ID :",-1)),g(" "+o(d.value.invoice_number),1)]),t("p",Ae,[e[6]||(e[6]=t("span",{class:"fw-bold"},"Order Date:",-1)),g(" "+o(d.value.ordered_at),1)])])]),t("table",Me,[e[10]||(e[10]=t("thead",{class:"table-light"},[t("tr",null,[t("th",null,"#"),t("th",null,"Description"),t("th",null,"Unit Price"),t("th",null,"Quantity"),t("th",null,"Subtotal")])],-1)),t("tbody",null,[(c(!0),m(P,null,j(d.value.items,b=>{var L;return c(),m("tr",{key:b.id},[t("td",null,o(b.product_id),1),t("td",null,o((L=b.product)==null?void 0:L.name_en),1),t("td",null,o(b.price)+" "+o(d.value.currency),1),t("td",null,o(b.quantity),1),t("td",null,o(b.subtotal),1)])}),128))]),t("tfoot",null,[t("tr",null,[e[8]||(e[8]=t("th",{colspan:"4",class:"text-end"},"Delivery",-1)),t("th",Ne,o(d.value.delivery_fee),1)]),t("tr",null,[e[9]||(e[9]=t("th",{colspan:"4",class:"text-end"},"Total",-1)),t("th",Le,o(d.value.currency)+" "+o(d.value.total_price),1)])])]),e[12]||(e[12]=t("p",{class:"mt-4 text-center fw-bold"},"Message happy to see you again",-1))])])]}),_:1},8,["modelValue","title"])])}}},Je=le(Te,[["__scopeId","data-v-2495655b"]]);export{Je as default};
