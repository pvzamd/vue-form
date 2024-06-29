<template>
  <div class="mb-5" v-if="tableDatas">
    <div class="mt-4">
      <h2>Submitted Form Data</h2>
      <div class="table-responsive">
        <table class="table table-bordered table-striped">
          <thead>
            <tr>
              <th scope="col">Groups</th>
              <th scope="col">Birth Date</th>
              <th scope="col">Gender</th>
              <th scope="col">Languages</th>
              <th scope="col">City</th>
              <th scope="col">File</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, index) in tableDatas" :key="index">
              <td>
                <ul class="list-unstyled">
                  <li v-for="(group, k) in data.groups" :key="k">
                    <p>
                      {{ k + 1 }} -
                      {{
                        `Name: ${group.name}, Email: ${group.email}, Mobile: ${group.mobile}`
                      }}
                    </p>
                  </li>
                </ul>
              </td>
              <td>{{ data.birthdate }}</td>
              <td>{{ data.gender }}</td>
              <td>
                <ul class="list-unstyled" v-if="data.languages">
                  <li v-for="(lang, i) in data.languages" :key="i">
                    {{ i + 1 }} - {{ lang }}
                  </li>
                </ul>
              </td>
              <td>
                <ul class="list-unstyled" v-if="data.city">
                  <li v-for="(city, j) in data.city" :key="j">
                    {{ j + 1 }} - {{ city }}
                  </li>
                </ul>
              </td>
              <td>{{ data.file ? data.file : "NA" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script setup props>
import { defineProps } from "vue";

const props = defineProps({
  tableDatas: Array,
});
</script>