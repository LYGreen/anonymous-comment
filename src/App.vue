<script setup>

import Profile from './components/Profile.vue';
import CommentLayout from './components/CommentLayout.vue';
import Sidebar from './components/Sidebar.vue';

</script>

<template>
  <Profile class="profile" />
  <CommentLayout class="comment-layout" />
  <Sidebar class="sidebar" />
</template>

<style scoped>

@media (max-width: 768px) {
  .profile {
    order: 1;
  }

  .comment-layout {
    order: 3;
  }

  .sidebar {
    order: 2;
  }
}

</style>
