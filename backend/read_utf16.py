import sys
def main():
    try:
        with open('d:/New folder/smart-healthcare-system/backend/inspect_out.txt', 'r', encoding='utf-16le') as f:
            print(f.read())
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    main()
