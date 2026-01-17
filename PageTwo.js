        const downloadBtn = document.getElementById('downloadBtn');
        
        function getFileExtension(lang) {
            const extensions = {
                javascript: 'js',
                python: 'py',
                java: 'java',
                cpp: 'cpp',
                csharp: 'cs',
            };
            
            return extensions[lang] || 'txt';
        }
        
        downloadBtn.addEventListener('click', function() {
            const code = convertedCode.textContent;
            const lang = toLang.value; //اللي هيجي من ال select language from page one
            const extension = getFileExtension(lang);
            const filename = `converted_code.${extension}`;
            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        });