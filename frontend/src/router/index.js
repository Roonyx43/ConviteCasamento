import { createRouter, createWebHistory } from "vue-router";
import PresentesView from "../pages/PresentesView.vue";
import PixView from "../pages/PixView.vue";

const routes = [
  { path: "/", name: "presentes", component: PresentesView },
  { path: "/pix", name: "pix", component: PixView }, // /pix?txid=...&amount=...&gift=...
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
