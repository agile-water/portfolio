<template>
  <SidebarProvider>
    <Sidebar>
      <SidebarHeader>
        <div class="px-2 py-1.5 text-sm font-semibold">shadcn-vue Playground</div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in items" :key="item.title">
                <SidebarMenuButton as-child>
                  <a href="javascript:void(0)">
                    <component :is="item.icon" />
                    <span>{{ item.title }}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div class="px-2 py-1.5 text-xs text-muted-foreground">테스트용 페이지</div>
      </SidebarFooter>
    </Sidebar>

    <SidebarInset>
      <header class="flex h-16 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <h1 class="text-lg font-semibold">Shadcn Sidebar 실험 페이지</h1>
      </header>
      <main class="p-4 text-sm text-muted-foreground">
        <p>
          이 페이지는 기존 레이아웃(SideBar.vue)과 독립된 실험용 라우트입니다.
          <code>/playground/shadcn-sidebar</code>에서만 접근 가능하고, 실제 서비스 화면에는 영향을 주지
          않습니다.
        </p>
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { Home, Inbox, Calendar, Search, Settings } from '@lucide/vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

const items = [
  { title: 'Home', icon: Home },
  { title: 'Inbox', icon: Inbox },
  { title: 'Calendar', icon: Calendar },
  { title: 'Search', icon: Search },
  { title: 'Settings', icon: Settings },
]
</script>
