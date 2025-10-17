from pathlib import Path
path = Path("server/src/routes/providers.ts")
lines = path.read_text().splitlines()
bt = chr(96)
lines[153] = f"  document.url = {bt}/uploads/${{file.filename}}{bt};"
lines[510] = f"  const attachmentUrl = file ? {bt}/uploads/${{file.filename}}{bt} : undefined;"
path.write_text('\n'.join(lines) + '\n')
