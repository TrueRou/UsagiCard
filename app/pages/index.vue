<script lang="ts" setup>
const { loggedIn, user, session, fetch, clear, openInPopup } = useUserSession()

const login = async () => {
  await $fetch("/api/auth/login", {
    method: "POST",
    body: {
      username: "user",
      password: "password"
    }
  });

  fetch()

  console.log(loggedIn.value, user.value, session.value)
}

const orders = useFetch('/api/orders')
</script>

<template>
  <div>
    <!-- <app-nav /> -->
    {{ user?.username }}
    <button class="btn" @click="login">Login</button>
    {{ orders.data }}
  </div>
</template>

<style></style>