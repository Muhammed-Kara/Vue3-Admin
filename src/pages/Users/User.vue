<template>
  <div class="user-page">
    <!-- API Bağlantı Uyarısı (Dashboard ile aynı görünüm) -->
    <Transition name="rise">
      <div v-if="usingMockData" class="notice-banner">
        <i class="pi pi-exclamation-triangle"></i>
        <p>
Gerçek sunucuya ulaşılamadı. Tasarımı inceleyebilmeniz için geçici veriler gösteriliyor.</p>
      </div>
    </Transition>

    <!-- Sayfa Başlığı ve Aksiyonlar -->
    <div class="panel-card flex justify-between items-center mb-6">
      <div>
        <h2 class="panel-title">Kullanıcı Yönetimi</h2>
        <p class="text-sm mt-1" style="color: var(--text-muted)">Sistemdeki tüm kullanıcıları buradan yönetebilirsiniz.</p>
      </div>
      <Button label="Yeni Kullanıcı Ekle" icon="pi pi-user-plus" severity="success" @click="openAddModal" class="px-4 py-2 font-medium" />
    </div>

    <!-- Veri Tablosu -->
    <div class="panel-card p-0 overflow-hidden">
      <DataTable
        :value="users"
        :loading="loading"
        paginator
        :rows="8"
        dataKey="id"
        emptyMessage="Kullanıcı bulunamadı."
        class="custom-theme-table"
      >
        <Column field="name" header="Ad Soyad" sortable style="min-width: 14rem; padding: 1rem 1.5rem;">
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <div class="avatar-circle">{{ getInitials(data.name) }}</div>
              <span class="font-medium">{{ data.name }}</span>
            </div>
          </template>
        </Column>
        <Column field="email" header="E-Posta Adresi" sortable style="min-width: 16rem"></Column>
        <Column field="role" header="Sistem Rolü" sortable style="min-width: 10rem">
          <template #body="{ data }">
            <span :class="['role-badge', data.role === 'Admin' ? 'badge-admin' : 'badge-user']">
              {{ data.role }}
            </span>
          </template>
        </Column>
        <Column field="status" header="Durum" style="min-width: 8rem">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <span :class="['status-dot', data.status === 'Aktif' ? 'bg-green-500' : 'bg-red-500']"></span>
              <span class="text-sm font-medium">{{ data.status }}</span>
            </div>
          </template>
        </Column>
        <Column header="İşlemler" style="min-width: 8rem; text-align: right;">
          <template #body="{ data }">
            <div class="flex gap-3 justify-end pr-4">
              <Button icon="pi pi-pencil" severity="info" text rounded aria-label="Düzenle" @click="openEditModal(data)" />
              <Button icon="pi pi-trash" severity="danger" text rounded aria-label="Sil" @click="confirmDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Ekleme / Düzenleme Modalı -->
    <Dialog
      v-model:visible="showUserModal"
      modal
      :closable="false"
      :style="{ width: '520px' }"
      class="custom-dialog user-form-dialog"
      @hide="resetFormState"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="modal-icon-badge" :class="isEditing ? 'is-edit' : 'is-add'">
            <i :class="isEditing ? 'pi pi-user-edit' : 'pi pi-user-plus'"></i>
          </div>
          <div>
            <h3 class="modal-title">{{ isEditing ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı' }}</h3>
            <p class="modal-subtitle">{{ isEditing ? 'Bilgileri güncelleyin ve kaydedin.' : 'Yeni bir kullanıcı hesabı oluşturun.' }}</p>
          </div>
        </div>
      </template>

      <form @submit.prevent="saveUser" class="flex flex-col gap-5 pt-2">
        <!-- Form Grid - Çerçeveli alan -->
        <div class="form-grid">
          <!-- Ad Soyad -->
          <div class="form-field-wrapper">
            <label class="field-label" for="userName">
              <i class="pi pi-user field-icon"></i>
              Ad Soyad
            </label>
            <div class="input-container">
              <InputText
                id="userName"
                v-model="userForm.name"
                required
                placeholder="Örn: Muhammed Kara"
                class="rounded-lg w-full custom-input"
                :class="{ 'field-invalid': fieldErrors.name }"
                :disabled="saving"
                @input="fieldErrors.name = false"
              />
            </div>
            <small v-if="fieldErrors.name" class="field-error">Ad soyad zorunludur.</small>
          </div>

          <!-- E-Posta -->
          <div class="form-field-wrapper">
            <label class="field-label" for="userEmail">
              <i class="pi pi-envelope field-icon"></i>
              E-Posta Adresi
            </label>
            <div class="input-container">
              <InputText
                id="userEmail"
                v-model="userForm.email"
                type="email"
                required
                placeholder="ornek@sirket.com"
                class="rounded-lg w-full custom-input"
                :class="{ 'field-invalid': fieldErrors.email }"
                :disabled="saving"
                @input="fieldErrors.email = false"
              />
            </div>
            <small v-if="fieldErrors.email" class="field-error">Geçerli bir e-posta adresi girin.</small>
          </div>

          <!-- Sistem Rolü - Tam genişlik -->
          <div class="form-field-wrapper full-width">
            <label class="field-label">
              <i class="pi pi-shield field-icon"></i>
              Sistem Rolü
            </label>
            <div class="input-container">
              <Dropdown
                v-model="userForm.role"
                :options="roles"
                placeholder="Rol Seçiniz"
                class="rounded-lg w-full custom-dropdown"
                :disabled="saving"
              >
                <template #value="{ value }">
                  <span v-if="value" class="flex items-center gap-2">
                    <span :class="['role-dot', value === 'Admin' ? 'dot-admin' : 'dot-user']"></span>
                    {{ value }}
                  </span>
                </template>
                <template #option="{ option }">
                  <span class="flex items-center gap-2">
                    <span :class="['role-dot', option === 'Admin' ? 'dot-admin' : 'dot-user']"></span>
                    {{ option }}
                  </span>
                </template>
              </Dropdown>
            </div>
          </div>
        </div>

        <div v-if="formError" class="form-error-banner">
          <i class="pi pi-exclamation-triangle"></i>
          <span>{{ formError }}</span>
        </div>

        <div class="modal-actions">
          <Button label="İptal" outlined severity="secondary" :disabled="saving" @click="showUserModal = false" class="action-btn" />
          <Button
         
            :label="isEditing ? 'Değişiklikleri Kaydet' : 'Kullanıcıyı Ekle'"
            type="submit"
            severity="primary"
            :loading="saving"
            class="action-btn"
           style="background-color: green;"


          />
        </div>
      </form>
    </Dialog>

    <!-- Silme Onay Modalı -->
    <Dialog
      v-model:visible="showDeleteModal"
      modal
      :closable="false"
      :style="{ width: '420px' }"
      class="custom-dialog delete-dialog"
    >
      <div class="delete-dialog-body">
        <div class="delete-icon-circle">
          <i class="pi pi-trash"></i>
        </div>
        <h3 class="delete-title">Emin misiniz?</h3>
        <p class="delete-text">
          <strong>{{ userToDelete?.name }}</strong> adlı kullanıcıyı silmek istediğinize emin misiniz?
        </p>
        <div v-if="deleteError" class="form-error-banner mt-4 w-full">
          <i class="pi pi-exclamation-triangle"></i>
          <span>{{ deleteError }}</span>
        </div>
        <div class="delete-actions">
          <Button label="İptal" text severity="secondary" :disabled="deleting" @click="showDeleteModal = false" class="action-btn" />
          <Button label="Sil" severity="danger" :loading="deleting" @click="executeDelete" class="action-btn" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { userService } from '../../services/userService';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';

const users = ref([]);
const loading = ref(true);
const usingMockData = ref(false);

const showUserModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const userToDelete = ref(null);

const saving = ref(false);
const deleting = ref(false);
const formError = ref('');
const deleteError = ref('');
const fieldErrors = ref({ name: false, email: false });

const roles = ref(['Admin', 'Editör', 'Kullanıcı']);
const userForm = ref({ id: null, name: '', email: '', role: 'Kullanıcı' });

const mockUsers = [
  { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@example.com', role: 'Admin', status: 'Aktif' },
  { id: 2, name: 'Ayşe Demir', email: 'ayse@example.com', role: 'Kullanıcı', status: 'Aktif' },
  { id: 3, name: 'Mehmet Kaya', email: 'mehmet@example.com', role: 'Kullanıcı', status: 'Pasif' },
];

const getInitials = (name = '') => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loadUsers = async () => {
  loading.value = true;
  try {
    const response = await userService.getUsers();
    users.value = response.data;
    usingMockData.value = false;
  } catch (err) {
    users.value = [...mockUsers];
    usingMockData.value = true;
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  isEditing.value = false;
  userForm.value = { id: null, name: '', email: '', role: 'Kullanıcı' };
  showUserModal.value = true;
};

const openEditModal = (user) => {
  isEditing.value = true;
  userForm.value = { ...user };
  showUserModal.value = true;
};

const resetFormState = () => {
  formError.value = '';
  fieldErrors.value = { name: false, email: false };
};

const validateForm = () => {
  fieldErrors.value.name = !userForm.value.name?.trim();
  fieldErrors.value.email = !userForm.value.email?.trim() || !emailRegex.test(userForm.value.email);
  return !fieldErrors.value.name && !fieldErrors.value.email;
};

const saveUser = async () => {
  formError.value = '';
  if (!validateForm()) return;

  saving.value = true;
  try {
    if (isEditing.value) {
      if (userService.updateUser) {
        await userService.updateUser(userForm.value.id, userForm.value);
      }
      const index = users.value.findIndex(u => u.id === userForm.value.id);
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...userForm.value };
      }
    } else {
      let created = {
        id: Math.floor(Math.random() * 100000),
        name: userForm.value.name,
        email: userForm.value.email,
        role: userForm.value.role,
        status: 'Aktif'
      };
      if (userService.createUser) {
        const response = await userService.createUser(created);
        created = response?.data ?? created;
      }
      users.value.unshift(created);
    }
    showUserModal.value = false;
  } catch (err) {
    formError.value = 'Kullanıcı kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.';
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (user) => {
  userToDelete.value = user;
  deleteError.value = '';
  showDeleteModal.value = true;
};

const executeDelete = async () => {
  if (!userToDelete.value) return;
  deleteError.value = '';
  deleting.value = true;
  try {
    if (userService.deleteUser) {
      await userService.deleteUser(userToDelete.value.id);
    }
    users.value = users.value.filter(user => user.id !== userToDelete.value.id);
    showDeleteModal.value = false;
    userToDelete.value = null;
  } catch (err) {
    deleteError.value = 'Kullanıcı silinirken bir hata oluştu. Lütfen tekrar deneyin.';
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.user-page { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; }

/* Dashboard ile aynı uyarı bandı */
.notice-banner {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: var(--surface-soft);
  border-left: 3px solid #B9762E;
  border-radius: 0 0.6rem 0.6rem 0;
  padding: 0.85rem 1rem;
  color: var(--text);
  font-size: 0.85rem;
}
.notice-banner i { color: #B9762E; font-size: 1.05rem; }
.notice-banner p { margin: 0; }

.rise-enter-active { transition: all 0.25s ease; }
.rise-enter-from { opacity: 0; transform: translateY(-6px); }

.panel-card {
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 1.5rem 2rem;
  color: var(--text);
}

.panel-title { margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--text); letter-spacing: -0.01em; }

.role-badge { padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.02em;}
.badge-admin { background: color-mix(in srgb, var(--accent-teal) 15%, transparent); color: var(--accent-teal); }
.badge-user { background: var(--surface-soft); color: var(--text-muted); }

.status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

.avatar-circle {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: color-mix(in srgb, var(--accent-teal) 18%, transparent);
  color: var(--accent-teal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

/* ============================================ */
/* TABLODAKİ İŞLEM BUTONLARI (Düzenle & Sil)    */
/* ============================================ */

:deep(.custom-theme-table .p-button.p-button-icon-only) {
  box-shadow: none !important;
  outline: none !important;
  background: transparent !important;
  border: none !important;
  color: var(--text-muted) !important;
  border-radius: 50% !important;
  transition: all 0.25s ease !important;
}

:deep(.custom-theme-table .p-button.p-button-icon-only:focus),
:deep(.custom-theme-table .p-button.p-button-icon-only:focus-visible),
:deep(.custom-theme-table .p-button.p-button-icon-only:active) {
  background: transparent !important;
}

:deep(.custom-theme-table .p-button.p-button-icon-only.p-button-danger:hover) {
  background: rgba(220, 38, 38, 0.12) !important;
  color: #dc2626 !important;
}

:deep(.custom-theme-table .p-button.p-button-icon-only.p-button-info:hover) {
  background: color-mix(in srgb, var(--accent-teal) 15%, transparent) !important;
  color: var(--accent-teal) !important;
}

/* ============================================ */
/* TABLO TEMA DÜZELTMELERİ                      */
/* ============================================ */
:deep(.custom-theme-table .p-datatable-header),
:deep(.custom-theme-table .p-datatable-thead > tr > th),
:deep(.custom-theme-table .p-datatable-tbody > tr > td),
:deep(.custom-theme-table .p-paginator) {
  background-color: var(--surface) !important;
  color: var(--text) !important;
  border-color: var(--border) !important;
}

:deep(.custom-theme-table .p-datatable-thead > tr > th) {
  background-color: var(--surface-soft) !important;
  color: var(--text-muted) !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding: 1rem 1.5rem;
}

:deep(.custom-theme-table .p-datatable-tbody > tr > td) {
  padding: 1rem 1.5rem;
}

:deep(.custom-theme-table .p-datatable-tbody > tr:hover > td) {
  background-color: var(--surface-soft) !important;
}

/* Yatay kaydırma çubuğu */
:deep(.custom-theme-table .p-datatable-wrapper) {
  scrollbar-color: var(--border) var(--surface);
  scrollbar-width: thin;
}
:deep(.custom-theme-table .p-datatable-wrapper::-webkit-scrollbar) {
  height: 10px;
  width: 10px;
}
:deep(.custom-theme-table .p-datatable-wrapper::-webkit-scrollbar-track) {
  background: var(--surface);
}
:deep(.custom-theme-table .p-datatable-wrapper::-webkit-scrollbar-thumb) {
  background-color: var(--border);
  border-radius: 9999px;
  border: 2px solid var(--surface);
}
:deep(.custom-theme-table .p-datatable-wrapper::-webkit-scrollbar-thumb:hover) {
  background-color: var(--text-muted);
}

/* Sayfalama (paginator) */
:deep(.custom-theme-table .p-paginator) {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border) !important;
  gap: 0.35rem;
}
:deep(.custom-theme-table .p-paginator .p-paginator-page),
:deep(.custom-theme-table .p-paginator .p-paginator-first),
:deep(.custom-theme-table .p-paginator .p-paginator-prev),
:deep(.custom-theme-table .p-paginator .p-paginator-next),
:deep(.custom-theme-table .p-paginator .p-paginator-last) {
  background-color: var(--surface-soft) !important;
  color: var(--text-muted) !important;
  border: 1px solid var(--border) !important;
  border-radius: 0.5rem;
  min-width: 2.25rem;
  height: 2.25rem;
  margin: 0 0.1rem;
  transition: background-color 0.15s ease, color 0.15s ease;
}
:deep(.custom-theme-table .p-paginator .p-paginator-page:hover),
:deep(.custom-theme-table .p-paginator .p-paginator-first:hover),
:deep(.custom-theme-table .p-paginator .p-paginator-prev:hover),
:deep(.custom-theme-table .p-paginator .p-paginator-next:hover),
:deep(.custom-theme-table .p-paginator .p-paginator-last:hover) {
  background-color: color-mix(in srgb, var(--accent-teal) 15%, transparent) !important;
  color: var(--accent-teal) !important;
}
:deep(.custom-theme-table .p-paginator .p-paginator-page.p-highlight) {
  background-color: var(--accent-teal) !important;
  color: #fff !important;
  border-color: var(--accent-teal) !important;
  font-weight: 600;
}
:deep(.custom-theme-table .p-paginator .p-dropdown) {
  height: 2.25rem !important;
  background-color: var(--surface-soft) !important;
  border: 1px solid var(--border) !important;
}
:deep(.custom-theme-table .p-paginator .p-dropdown .p-dropdown-label) {
  color: var(--text) !important;
}

/* ============================================ */
/* TÜM DİALOGLAR - KARANLIK/AYDINLIK TEMA DESTEĞİ */
/* ============================================ */

:deep(.custom-dialog.p-dialog),
:deep(.p-dialog.custom-dialog) {
  background: var(--surface) !important;
  border: 1.5px solid var(--border) !important;
  border-radius: 0.85rem !important;
  overflow: hidden !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15) !important;
}

:deep(.custom-dialog .p-dialog-header),
:deep(.custom-dialog .p-dialog-content),
:deep(.custom-dialog .p-dialog-footer) {
  background: var(--surface) !important;
  color: var(--text) !important;
  border: none !important;
}

:deep(.custom-dialog .p-dialog-header) {
  border-bottom: 1px solid var(--border) !important;
  padding: 1.5rem;
}

:deep(.custom-dialog .p-dialog-content) {
  padding: 1.5rem;
  background: var(--surface) !important;
}

/* Silme Dialogu - Ortalanmış İçerik */
.delete-dialog :deep(.p-dialog-content) {
  padding: 1.75rem 1.5rem 1.5rem;
  background: var(--surface) !important;
}

.delete-dialog-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

.delete-icon-circle {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  background-color: color-mix(in srgb, #dc2626 15%, transparent);
  border: 2px solid color-mix(in srgb, #dc2626 20%, transparent);
}

.delete-icon-circle i {
  font-size: 1.75rem;
  color: #dc2626;
  line-height: 1;
}

.delete-title { 
  margin: 0 0 0.5rem; 
  font-size: 1.25rem; 
  font-weight: 700; 
  color: var(--text); 
}

.delete-text { 
  margin: 0; 
  font-size: 0.875rem; 
  line-height: 1.6; 
  color: var(--text-muted); 
}

.delete-actions {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center !important;
  gap: 0.75rem;
  margin-top: 1.75rem;
  width: 100%;
}

.delete-actions .action-btn {
  flex: 0 0 auto !important;
  width: auto !important;
  min-width: 7rem;
}

/* ============================================ */
/* FORM VE INPUT STİLLERİ (HEM AYDINLIK HEM KARANLIK UYUMLU) */
/* ============================================ */

/* Form Grid - Aydınlık ve karanlık temada sırıtmaması için transparan/hafif gri arka plan */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  padding: 1.5rem;
  background: rgba(128, 128, 128, 0.08); /* Her iki temada da uyumlu yumuşak zemin */
  border-radius: 0.85rem;
  border: 1px solid var(--border);
}

.form-field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field-wrapper.full-width {
  grid-column: 1 / -1;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.field-icon {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Input Container */
.input-container {
  position: relative;
  width: 100%;
}

/* Özel Input Stilleri - Kesin Belirgin Çerçeve */
:deep(.custom-input),
:deep(.custom-dropdown) {
  background: var(--surface) !important;
  color: var(--text) !important;
  /* color-mix yerine doğrudan çok belirgin bir gri kullanıldı */
  border: 2px solid #6b7280 !important; /* Hem dark hem light temada çok net görünür */
  border-radius: 0.6rem !important;
  height: 2.75rem;
  width: 100%;
  transition: all 0.2s ease;
}

:deep(.custom-input) {
  padding: 0 0.9rem;
}

:deep(.custom-input:focus),
:deep(.custom-dropdown:focus),
:deep(.custom-dropdown.p-focus) {
  border-color: var(--accent-teal) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-teal) 15%, transparent) !important;
  outline: none !important;
}

:deep(.custom-input:hover),
:deep(.custom-dropdown:hover) {
  border-color: #9ca3af !important; /* Üzerine gelindiğinde biraz daha açılır */
}

:deep(.custom-input.field-invalid) {
  border-color: var(--accent-rust) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-rust) 15%, transparent) !important;
}

:deep(.custom-dropdown .p-dropdown-label) {
  display: flex;
  align-items: center;
  padding: 0 0.9rem;
  height: 100%;
  color: var(--text);
}

:deep(.custom-dropdown .p-dropdown-trigger) {
  width: 2.75rem;
  color: var(--text-muted);
}

:deep(.custom-dropdown .p-dropdown-trigger:hover) {
  color: var(--text);
}

/* Dropdown Panel - Çerçevesi inputla aynı yapıldı */
:deep(.p-dropdown-panel) {
  background: var(--surface) !important;
  color: var(--text) !important;
  border: 2px solid #6b7280 !important; /* Panel de belirgin oldu */
  border-radius: 0.6rem !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
}

:deep(.p-dropdown-items .p-dropdown-item) {
  color: var(--text) !important;
  padding: 0.65rem 0.9rem;
  transition: background 0.15s ease;
}

:deep(.p-dropdown-items .p-dropdown-item:hover) {
  background: rgba(128, 128, 128, 0.1) !important;
}

:deep(.p-dropdown-items .p-dropdown-item.p-highlight) {
  background: color-mix(in srgb, var(--accent-teal) 15%, transparent) !important;
  color: var(--accent-teal) !important;
}

/* Kullanıcı formu modalı başlığı */
.modal-icon-badge {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.modal-icon-badge.is-add {
  background: color-mix(in srgb, var(--accent-teal) 15%, transparent);
  color: var(--accent-teal);
}

.modal-icon-badge.is-edit {
  background: color-mix(in srgb, var(--accent-rust) 15%, transparent);
  color: var(--accent-rust);
}

.modal-title { 
  margin: 0; 
  font-size: 1.05rem; 
  font-weight: 700; 
  color: var(--text); 
}

.modal-subtitle { 
  margin: 0.15rem 0 0; 
  font-size: 0.8rem; 
  color: var(--text-muted); 
}

.field-error { 
  color: var(--accent-rust); 
  font-size: 0.75rem; 
  margin-top: 0.15rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.field-error::before {
  content: "•";
  font-weight: bold;
}

.form-error-banner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 0.6rem;
  background: color-mix(in srgb, var(--accent-rust) 12%, transparent);
  color: var(--accent-rust);
  font-size: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--accent-rust) 20%, transparent);
}

/* Alt aksiyon butonları — modal footer */
.modal-actions {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center !important; 
  gap: 0.75rem;
  margin-top: 0.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
}

.action-btn {
  flex: 0 0 auto !important;
  width: auto !important;
  min-width: 8.5rem;
  padding: 0.65rem 1.25rem !important;
  font-weight: 500;
  justify-content: center;
  border-radius: 0.6rem !important;
  transition: all 0.2s ease;
}

.role-dot { 
  width: 8px; 
  height: 8px; 
  border-radius: 50%; 
  display: inline-block; 
}

.dot-admin { 
  background: var(--accent-teal); 
}

.dot-user { 
  background: var(--text-muted); 
}

/* Buton stilleri */
:deep(.p-button) {
  border-radius: 0.6rem !important;
  transition: all 0.2s ease;
}

:deep(.p-button.p-button-secondary) {
  background: var(--surface-soft) !important;
  border-color: var(--border) !important;
  color: var(--text) !important;
}

:deep(.p-button.p-button-secondary:hover) {
  background: var(--border) !important;
}

:deep(.p-button.p-button-success) {
  background: var(--accent-teal) !important;
  border-color: var(--accent-teal) !important;
}

:deep(.p-button.p-button-success:hover) {
  background: color-mix(in srgb, var(--accent-teal) 85%, #000) !important;
}

:deep(.p-button.p-button-danger) {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
}

:deep(.p-button.p-button-danger:hover) {
  background: #b91c1c !important;
}

:deep(.p-button.p-button-info) {
  color: var(--accent-teal) !important;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
  
  .modal-actions, 
  .delete-actions { 
    flex-direction: column-reverse !important; 
  }
  
  .action-btn { 
    width: 100% !important; 
    min-width: unset;
  }
  
  :deep(.custom-dialog.p-dialog) {
    width: 95% !important;
    margin: 0.5rem;
  }
}
</style>