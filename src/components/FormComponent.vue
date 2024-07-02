
<script setup>
import { reactive, ref } from "vue";
import axios from "axios";
import { useDateUtils } from "../composables/dateUtils";
import TableComponent from "./TableComponent.vue";
import ErrorComponent from "./ErrorComponent.vue";
import { languages, cities } from "../constants/index";

const { formatDate } = useDateUtils();

const groups = reactive([{ name: "", email: "", mobile: "" }]);
const groupsError = reactive([{ name: "", email: "", mobile: "" }]);
const birthdate = ref("");
const gender = ref("");
const selectedLanguages = ref([]);
const selectedCity = ref([]);
const file = ref(null);
const submittedData = ref(null);
const fileInput = ref(null);

const errorInForms = ref(false);

const addGroup = () => {
  groups.push({ name: "", email: "", mobile: "" });
  groupsError.push({ name: "", email: "", mobile: "" });
};

const removeGroup = (index) => {
  groups.splice(index, 1);
  groupsError.splice(index, 1);
};

const handleFileUpload = (event) => {
  file.value = event.target.files[0];
};

const removeFile = (event) => {
  errorInForms.value = false;
  file.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const removeError = (index, field) => {
  groupsError[index][field] = "";
};

const validateField = (index, field) => {
  if (groups[index][field].trim() === "") {
    groupsError[index][field] = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } is required`;
  } else if (field == "mobile" && groups[index][field].length != 14) {
    groupsError[index][field] = `Enter 10 digits`;
  } else {
    groupsError[index][field] = "";
  }
};

const formatPhone = (event, index) => {
  groupsError[index]["mobile"] = "";
  let value = event.target.value.replace(/\D/g, "");
  if (value.length > 10) {
    value = value.slice(0, 10);
  }
  value = value.replace(/(\d{0,3})(\d{0,3})(\d{0,4})/, (match, p1, p2, p3) => {
    if (p2) {
      return `(${p1}) ${p2}${p3 ? "-" + p3 : ""}`;
    } else if (p1) {
      return `(${p1}`;
    }
    return "";
  });
  groups[index].mobile = value;
};

const areAllFieldsEmpty = (data) => {
  return data.every((item) => {
    return Object.values(item).every((value) => value === "");
  });
};

const handleSubmit = async () => {
  errorInForms.value = false;
  groups.forEach((group, index) => {
    ["name", "email", "mobile"].forEach((field) => {
      validateField(index, field);
    });
  });

  if (!areAllFieldsEmpty(groupsError)) {
    return;
  }

  if (birthdate.value == "") {
    return;
  }

  if (gender.value == "") {
    return;
  }

  const payload = {
    groups: groups.map((e) => {
      return {
        name: e.name,
        email: e.email,
        mobile: e.mobile.replace(/\D/g, ""),
      };
    }),
    birthdate: formatDate(birthdate.value),
    gender: gender.value,
    languages: selectedLanguages.value,
    city: selectedCity.value,
    file: null,
  };

  if (file.value) {
    const reader = new FileReader();
    reader.readAsDataURL(file.value);
    reader.onload = async () => {
      // throwing error for maximum limit for file
      // payload.file = reader.result;
      payload.file = file.value.name;

      callApi(payload);
    };
    reader.onerror = (error) => {
      console.error("File reading error:", error);
    };
  } else {
    callApi(payload);
  }
};

const callApi = async (payload) => {
  try {
    const response = await axios.post(
      "http://localhost:4000/postdata",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data) {
      submittedData.value = response.data;
      //will clear inputs after submit
      //clearForm();
      errorInForms.value = false;
    } else {
      errorInForms.value = true;
    }
  } catch (error) {
    console.error("API error:", error);
    errorInForms.value = true;
  }
};

const clearForm = () => {
  groups = [{ name: "", email: "", mobile: "" }];
  groupsError = [{ name: "", email: "", mobile: "" }];
  birthdate.value = "";
  gender.value = "";
  selectedLanguages.value = [];
  selectedCity.value = [];
  file.value = null;
  removeFile();
};
</script>

<template>
  <div class="container mt-5">
    <div class="card mb-5">
      <div class="card-header">
        <h4 class="card-title">User Information</h4>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div v-for="(group, index) in groups" :key="index" class="mb-4">
            <div class="row g-3">
              <div class="col-md-4">
                <div class="mb-3">
                  <label :for="'name' + index" class="form-label"
                    >Name
                    <span class="required-icon">*</span>
                  </label>
                  <input
                    type="text"
                    :id="'name' + index"
                    class="form-control light-placeholder"
                    placeholder="John Doe"
                    v-model="group.name"
                    @input="removeError(index, 'name')"
                  />
                  <span class="text-danger" v-if="groupsError[index].name">{{
                    groupsError[index].name
                  }}</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="mb-3">
                  <label :for="'email' + index" class="form-label"
                    >Email
                    <span class="required-icon">*</span>
                  </label>
                  <input
                    type="email"
                    :id="'email' + index"
                    class="form-control light-placeholder"
                    placeholder="abc@example.com"
                    v-model="group.email"
                    @input="removeError(index, 'email')"
                  />
                  <span class="text-danger" v-if="groupsError[index].email">{{
                    groupsError[index].email
                  }}</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="mb-3">
                  <label :for="'mobile' + index" class="form-label"
                    >Mobile Number <span class="required-icon">*</span>
                  </label>
                  <input
                    type="tel"
                    :id="'mobile' + index"
                    class="form-control light-placeholder"
                    v-model="group.mobile"
                    placeholder="(844) 448-0110"
                    @input="formatPhone($event, index)"
                  />
                  <span class="text-danger" v-if="groupsError[index].mobile">{{
                    groupsError[index].mobile
                  }}</span>
                </div>
              </div>
              <div class="col-md-4">
                <button
                  type="button"
                  class="btn btn-danger mb-4"
                  @click="removeGroup(index)"
                  v-if="groups.length > 1"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <button type="button" class="btn btn-primary mb-4" @click="addGroup">
            + Add More
          </button>

          <div class="mb-3">
            <label for="birthdate bold-text" class="form-label"
              >Birth Date <span class="required-icon">*</span>
            </label>
            <input
              type="date"
              id="birthdate"
              class="form-control"
              v-model="birthdate"
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label bold-text"
              >Gender <span class="required-icon">*</span> </label
            ><br />
            <div class="form-check form-check-inline">
              <input
                class="form-check-input"
                type="radio"
                id="male"
                value="Male"
                v-model="gender"
                required
              />
              <label class="form-check-label" for="male">Male</label>
            </div>
            <div class="form-check form-check-inline">
              <input
                class="form-check-input"
                type="radio"
                id="female"
                value="Female"
                v-model="gender"
                required
              />
              <label class="form-check-label" for="female">Female</label>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label bold-text">Language</label><br />
            <div
              class="form-check form-check-inline"
              v-for="language in languages"
              :key="language"
            >
              <input
                class="form-check-input"
                type="checkbox"
                :id="language"
                :value="language"
                v-model="selectedLanguages"
              />
              <label class="form-check-label" :for="language">{{
                language
              }}</label>
            </div>
          </div>

          <div class="mb-3">
            <label for="city" class="form-label bold-text">City</label>
            <select
              id="city"
              class="form-select"
              v-model="selectedCity"
              multiple
            >
              <option v-for="city in cities" :key="city" :value="city">
                {{ city }}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label for="file" class="form-label bold-text">File Upload</label>
            <input
              type="file"
              id="file"
              class="form-control"
              @change="handleFileUpload"
              accept=".jpeg, .pdf"
              ref="fileInput"
            />
            <template v-if="file">
              <div
                class="btn btn-outline-danger my-1"
                @click.stop.prevent="removeFile"
              >
                Remove File
              </div>
            </template>
          </div>

          <button type="submit" class="btn btn-primary">Submit</button>
        </form>
      </div>
    </div>
    <template v-if="submittedData">
      <TableComponent :tableDatas="submittedData" />
    </template>
    <template v-if="errorInForms">
      <ErrorComponent />
    </template>
  </div>
</template>

<style scoped>
form {
  margin-bottom: 20px;
}
.light-placeholder::placeholder {
  color: #c0bebe;
}
.bold-text {
  font-weight: bold;
}
.required-icon {
  color: red;
  margin-left: 5px;
}
</style>
