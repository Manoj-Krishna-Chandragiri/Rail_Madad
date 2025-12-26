import win32com.client
import sys

try:
    word = win32com.client.Dispatch('Word.Application')
    word.Visible = False
    doc = word.Documents.Open(r'D:\Projects\Rail_Madad\railmadad.doc')
    text = doc.Content.Text
    doc.Close(False)
    word.Quit()
    print(text)
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
    sys.exit(1)
