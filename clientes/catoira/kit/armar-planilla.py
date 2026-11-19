# Planilla de prospección de Catoira: contactos (50 filas + 1 de ejemplo), resumen semanal y cómo usarla.
# Uso: python3 clientes/catoira/kit/armar-planilla.py  → kit/planilla-prospeccion-catoira.xlsx
import datetime as dt
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
from openpyxl.utils import get_column_letter as L
from openpyxl.comments import Comment

out = Path(__file__).resolve().parent / 'planilla-prospeccion-catoira.xlsx'
F = 'Arial'
PET, VERDE, AGUA, HUESO = '0A2C4E', '13857F', '5FD0C1', 'EEF3F1'
h_font = Font(name=F, bold=True, color='FFFFFF', size=10)
h_fill = PatternFill('solid', fgColor=PET)
in_fill = PatternFill('solid', fgColor='FFF7D6')     # celdas que completa Fernando
ej_fill = PatternFill('solid', fgColor='E8F5F2')
thin = Side(style='thin', color='D5DEDC'); B = Border(left=thin, right=thin, top=thin, bottom=thin)
base = Font(name=F, size=10); blue = Font(name=F, size=10, color='0000FF'); bold = Font(name=F, size=10, bold=True)
wb = Workbook()

# ---------------- Contactos ----------------
ws = wb.active; ws.title = 'Contactos'
cols = [('N°', 5), ('Negocio', 30), ('Tipo', 22), ('Zona', 18), ('Persona de contacto', 20), ('WhatsApp / teléfono', 17),
        ('Instagram', 18), ('Canal', 12), ('Fecha 1er mensaje', 13), ('Seguimiento día 3', 13), ('Seguimiento día 7', 13),
        ('¿Respondió?', 11), ('¿Visita agendada?', 11), ('Fecha de visita', 13), ('¿Presupuesto enviado?', 12), ('¿Cerrado?', 10),
        ('Monto cerrado (UYU)', 14), ('Semana del', 12), ('Estado (automático)', 20), ('Próximo paso / notas', 36)]
C = {n: L(i + 1) for i, (n, _) in enumerate(cols)}
for i, (n, w) in enumerate(cols, 1):
    c = ws.cell(row=1, column=i, value=n); c.font = h_font; c.fill = h_fill; c.border = B
    c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True); ws.column_dimensions[L(i)].width = w
ws.row_dimensions[1].height = 34
ws.freeze_panes = 'C2'
FIRST, LAST = 2, 52          # fila 2 = ejemplo, 3–52 = 50 contactos
auto = {'Seguimiento día 3', 'Seguimiento día 7', 'Semana del', 'Estado (automático)', 'N°'}
for r in range(FIRST, LAST + 1):
    i = C['Fecha 1er mensaje']
    ws[f"{C['N°']}{r}"] = '=IF(B{0}="","",ROW()-2)'.format(r) if r > 2 else 'Ej.'
    ws[f"{C['Seguimiento día 3']}{r}"] = f'=IF({i}{r}="","",{i}{r}+3)'
    ws[f"{C['Seguimiento día 7']}{r}"] = f'=IF({i}{r}="","",{i}{r}+7)'
    ws[f"{C['Semana del']}{r}"] = f'=IF({i}{r}="","",{i}{r}-WEEKDAY({i}{r},2)+1)'
    rr, ve, pr, ce, d3, d7 = (C[k] + str(r) for k in ['¿Respondió?', '¿Visita agendada?', '¿Presupuesto enviado?', '¿Cerrado?', 'Seguimiento día 3', 'Seguimiento día 7'])
    ws[f"{C['Estado (automático)']}{r}"] = (f'=IF(B{r}="","",IF({ce}="Sí","Cerrado",IF({pr}="Sí","Presupuesto enviado",IF({ve}="Sí","Visita agendada",'
        f'IF({rr}="Sí","Respondió",IF({i}{r}="","Por contactar",IF({rr}="No","Sin respuesta",IF(TODAY()>={d7},"Toca seguimiento día 7",'
        f'IF(TODAY()>={d3},"Toca seguimiento día 3","Esperando respuesta")))))))))')
    for n, _ in cols:
        c = ws[f'{C[n]}{r}']; c.border = B; c.font = base; c.alignment = Alignment(vertical='center', wrap_text=(n == 'Próximo paso / notas'))
        if n not in auto: c.fill = ej_fill if r == 2 else in_fill
        if n in ('Fecha 1er mensaje', 'Seguimiento día 3', 'Seguimiento día 7', 'Fecha de visita', 'Semana del'): c.number_format = 'DD/MM/YYYY'
        if n == 'Monto cerrado (UYU)': c.number_format = '#,##0;-#,##0;-'
        if n in ('N°',): c.alignment = Alignment(horizontal='center', vertical='center')
# Fila de ejemplo (marcada, para borrar o pisar)
ej = {'Negocio': 'EJEMPLO · Administración de edificios (borrar)', 'Tipo': 'Administradora', 'Zona': 'Pocitos', 'Persona de contacto': 'Encargado/a de mantenimiento',
      'WhatsApp / teléfono': '09X XXX XXX', 'Instagram': '@ejemplo', 'Canal': 'WhatsApp', 'Fecha 1er mensaje': dt.date(2026, 11, 23),
      '¿Respondió?': 'Sí', '¿Visita agendada?': 'Sí', 'Fecha de visita': dt.date(2026, 11, 27), '¿Presupuesto enviado?': 'No', '¿Cerrado?': 'No',
      'Próximo paso / notas': 'Visita de relevamiento el viernes. Llevar propuesta de limpieza programada.'}
for k, v in ej.items(): c = ws[f'{C[k]}2']; c.value = v; c.font = Font(name=F, size=10, italic=True, color='4A6670')
ws[f"{C['Negocio']}2"].comment = Comment('Fila de ejemplo: muestra cómo se completa. Borrala o escribí encima.', 'Aicia')
# Listas desplegables
def lista(vals, col):
    dv = DataValidation(type='list', formula1='"' + ','.join(vals) + '"', allow_blank=True); ws.add_data_validation(dv); dv.add(f'{col}{FIRST}:{col}{LAST}')
lista(['Administradora', 'Inmobiliaria', 'Comercio con grasera', 'Particular', 'Otro'], C['Tipo'])
lista(['WhatsApp', 'Instagram', 'Llamada', 'Correo', 'En persona'], C['Canal'])
for k in ['¿Respondió?', '¿Visita agendada?', '¿Presupuesto enviado?', '¿Cerrado?']: lista(['Sí', 'No'], C[k])
# Colores del estado
est = C['Estado (automático)']
for txt, color in [('Cerrado', 'C8EED8'), ('Toca seguimiento', 'FFE2B8'), ('Visita agendada', 'D6ECFF'), ('Presupuesto enviado', 'E6DDFB'), ('Sin respuesta', 'EDEDED')]:
    ws.conditional_formatting.add(f'{est}{FIRST}:{est}{LAST}', FormulaRule(formula=[f'ISNUMBER(SEARCH("{txt}",{est}{FIRST}))'], fill=PatternFill('solid', fgColor=color), font=Font(name=F, size=10, bold=True)))

# ---------------- Resumen semanal ----------------
rs = wb.create_sheet('Resumen semanal')
rs['A1'] = 'Resumen semanal de la campaña'; rs['A1'].font = Font(name=F, size=14, bold=True, color=PET)
rs['A2'] = 'Se completa solo con la hoja Contactos. Solo cambiá las celdas amarillas.'; rs['A2'].font = Font(name=F, size=10, italic=True, color='4A6670')
rs['A4'] = 'Primer lunes de la campaña'; rs['B4'] = dt.date(2026, 11, 23); rs['B4'].number_format = 'DD/MM/YYYY'
rs['A5'] = 'Meta: contactos nuevos por semana'; rs['B5'] = 15
for a in ('B4', 'B5'): rs[a].fill = in_fill; rs[a].font = blue; rs[a].border = B
for a in ('A4', 'A5'): rs[a].font = bold
rs['C4'] = 'Fecha de ejemplo: cambiala por el lunes en que empieces.'
rs['C5'] = 'Meta de actividad (lo que depende de vos): 3 por día hábil. Ajustala con los números de las 2 primeras semanas.'
for a in ('C4', 'C5'): rs[a].font = Font(name=F, size=9, italic=True, color='4A6670')
hd = ['Semana del', 'Contactados', 'Meta', '% de la meta', 'Respondieron', '% respuesta', 'Visitas agendadas', 'Presupuestos', 'Cerrados', 'Monto cerrado (UYU)']
for i, n in enumerate(hd, 1):
    c = rs.cell(row=7, column=i, value=n); c.font = h_font; c.fill = h_fill; c.border = B; c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    rs.column_dimensions[L(i)].width = 16 if i > 1 else 34
rs.row_dimensions[7].height = 32
S = "Contactos!$" + C['Semana del'] + "$3:$" + C['Semana del'] + "$" + str(LAST)     # fila 2 (ejemplo) fuera del conteo
col = lambda k: "Contactos!$" + C[k] + "$3:$" + C[k] + "$" + str(LAST)
for w in range(8):
    r = 8 + w
    rs[f'A{r}'] = '=$B$4' if w == 0 else f'=A{r-1}+7'; rs[f'A{r}'].number_format = 'DD/MM/YYYY'
    rs[f'B{r}'] = f'=COUNTIFS({S},A{r})'
    rs[f'C{r}'] = '=$B$5'
    rs[f'D{r}'] = f'=IF(C{r}=0,"",B{r}/C{r})'; rs[f'D{r}'].number_format = '0%'
    rs[f'E{r}'] = f'=COUNTIFS({S},A{r},{col("¿Respondió?")},"Sí")'
    rs[f'F{r}'] = f'=IF(B{r}=0,"",E{r}/B{r})'; rs[f'F{r}'].number_format = '0%'
    rs[f'G{r}'] = f'=COUNTIFS({S},A{r},{col("¿Visita agendada?")},"Sí")'
    rs[f'H{r}'] = f'=COUNTIFS({S},A{r},{col("¿Presupuesto enviado?")},"Sí")'
    rs[f'I{r}'] = f'=COUNTIFS({S},A{r},{col("¿Cerrado?")},"Sí")'
    rs[f'J{r}'] = f'=SUMIFS({col("Monto cerrado (UYU)")},{S},A{r})'; rs[f'J{r}'].number_format = '#,##0;-#,##0;-'
    for i in range(1, 11): rs.cell(row=r, column=i).border = B; rs.cell(row=r, column=i).font = base
T = 16
rs[f'A{T}'] = 'Total (8 semanas)'
for k in 'BCEGHIJ': rs[f'{k}{T}'] = f'=SUM({k}8:{k}15)'
rs[f'D{T}'] = f'=IF(C{T}=0,"",B{T}/C{T})'; rs[f'D{T}'].number_format = '0%'
rs[f'F{T}'] = f'=IF(B{T}=0,"",E{T}/B{T})'; rs[f'F{T}'].number_format = '0%'
rs[f'J{T}'].number_format = '#,##0;-#,##0;-'
for i in range(1, 11): c = rs.cell(row=T, column=i); c.font = bold; c.border = B; c.fill = PatternFill('solid', fgColor=HUESO)
# Por tipo de cliente
rs['A19'] = 'Por tipo de cliente (toda la campaña)'; rs['A19'].font = Font(name=F, size=12, bold=True, color=PET)
for i, n in enumerate(['Tipo', 'Contactados', 'Respondieron', 'Visitas agendadas', 'Cerrados'], 1):
    c = rs.cell(row=20, column=i, value=n); c.font = h_font; c.fill = h_fill; c.border = B; c.alignment = Alignment(horizontal='center', wrap_text=True)
for j, t in enumerate(['Administradora', 'Inmobiliaria', 'Comercio con grasera', 'Particular', 'Otro']):
    r = 21 + j; rs[f'A{r}'] = t
    rs[f'B{r}'] = f'=COUNTIFS({col("Tipo")},A{r},{col("Fecha 1er mensaje")},"<>")'
    rs[f'C{r}'] = f'=COUNTIFS({col("Tipo")},A{r},{col("¿Respondió?")},"Sí")'
    rs[f'D{r}'] = f'=COUNTIFS({col("Tipo")},A{r},{col("¿Visita agendada?")},"Sí")'
    rs[f'E{r}'] = f'=COUNTIFS({col("Tipo")},A{r},{col("¿Cerrado?")},"Sí")'
    for i in range(1, 6): rs.cell(row=r, column=i).border = B; rs.cell(row=r, column=i).font = base
rs['A27'] = 'Hoy toca seguimiento'; rs['A27'].font = bold
rs['B27'] = f'=COUNTIFS({col("Estado (automático)")},"Toca seguimiento*")'; rs['B27'].font = bold; rs['B27'].border = B
rs['C27'] = 'contactos (filtrá la columna Estado en la hoja Contactos para verlos).'; rs['C27'].font = Font(name=F, size=9, italic=True, color='4A6670')

# ---------------- Cómo usarla ----------------
cu = wb.create_sheet('Cómo usarla', 0)
cu.column_dimensions['A'].width = 4; cu.column_dimensions['B'].width = 110
lines = [('Planilla de prospección · A. Servicios Integrales Catoira', 'title'),
 ('Sirve para saber, cada semana, a cuántos les escribiste, cuántos respondieron, cuántas visitas salieron y cuántos trabajos cerraste.', 'sub'), ('', ''),
 ('Cómo se usa', 'h'),
 ('1. En "Contactos", cargá cada negocio en una fila: nombre, tipo, zona y cómo contactarlo (WhatsApp o Instagram). La fila 2 es un ejemplo: borrala o escribí encima.', ''),
 ('2. Cuando le mandes el primer mensaje, poné la fecha en "Fecha 1er mensaje". Las fechas de seguimiento (día 3 y día 7) se calculan solas.', ''),
 ('3. Cada vez que pase algo, cambiá las columnas Sí/No: ¿Respondió?, ¿Visita agendada?, ¿Presupuesto enviado?, ¿Cerrado?.', ''),
 ('4. La columna "Estado" se actualiza sola y se pinta de naranja cuando toca un seguimiento. Filtrala para ver a quién escribirle hoy.', ''),
 ('5. "Resumen semanal" junta todo. Cambiá solo las celdas amarillas: el primer lunes de la campaña y la meta.', ''), ('', ''),
 ('Colores', 'h'),
 ('Amarillo claro: celdas que completás vos.  ·  Blanco: se calculan solas (no las toques).  ·  Celeste: fila de ejemplo.', ''), ('', ''),
 ('Rutina sugerida (20–30 minutos por día)', 'h'),
 ('• 3 contactos nuevos por día hábil (15 por semana). Mensajes personalizados, de a uno: nada de envíos masivos.', ''),
 ('• Todos los seguimientos del día al día. Después del día 7, si no respondió, se marca "No" en ¿Respondió? y se deja tranquilo.', ''),
 ('• Si alguien pide que no le escribas más, respetalo y anotalo en notas.', ''),
 ('• Cada viernes, mirá el resumen: ¿qué tipo de cliente responde más? Ahí conviene poner más energía la semana siguiente.', ''), ('', ''),
 ('Orden de la lista de 50', 'h'),
 ('20 administradoras de edificios · 15 inmobiliarias · 15 comercios con cámara grasera (restaurantes, rotiserías, parrillas, panaderías).', ''),
 ('Dónde buscarlos: Google Maps ("administración de edificios Pocitos", "inmobiliaria Solymar", "rotisería Lagomar") e Instagram (buscador y ubicaciones).', '')]
for i, (t, k) in enumerate(lines, 1):
    c = cu.cell(row=i, column=2, value=t); c.alignment = Alignment(wrap_text=True, vertical='top')
    c.font = {'title': Font(name=F, size=15, bold=True, color=PET), 'sub': Font(name=F, size=10, italic=True, color='4A6670'), 'h': Font(name=F, size=11, bold=True, color=VERDE)}.get(k, base)
wb.active = 0
wb.save(out); print(out)
