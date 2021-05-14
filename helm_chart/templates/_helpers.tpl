{{- define "app_name" -}}
{{  .Values.app.name }}
{{- end -}}

{{- define "branch" -}}
{{  .Values.branch }}
{{- end -}}

{{- define "resource_name" -}}
{{ include "app_name" . }}-{{ include "branch" . }}
{{- end -}}

{{- define "pod_labels" -}}
project: {{ $.Values.project }}
app: {{ include "app_name" . }}
branch: {{ include "branch" . }}
{{- end -}}
