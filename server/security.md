# ithousecrm.uz - SERVER

```  

Servergs kirish uchun
login: ssh root@80.78.255.132
password: F!Myk*o3@F_F

Reg.ru uchun
Server email: shahriyorgithub0707@mail.ru
Server password: 124536798assaassa


DNS address: https://dnsadmin.hosting.reg.ru/manager/ispmgr
DNS login: ce75384937
DNS password: PSGPeAw!oJ4DXaL
DNS names: ns5.hosting.reg.ru / ns6.hosting.reg.ru

cd ../home/it-house-server/
git pull https://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:x-oauth-basic@github.com/gargamelNodejs/it-house-server.git







```





# ithousecrm.uz - SMS
```
login: ithouseedu@gmail.com
password: mashhad1994
token: 5t9rfCXmPzYG0BjEYVx33kjOiiDm1hBo7tlH8LnV
SMS login address: https://my.eskiz.uz
```


# ithousecrm.uz - SERVER-SETTINGS
```
1. ---------------------   "Node.js" ni serverga o'rnatish
sudo apt update
sudo apt install curl
curl -sL https://deb.nodesource.com/setup_16.x -o nodesource_setup.sh
nano nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt install nodejs




2. ---------------------   "MongoDB" ni serverga o'rnatish
curl -fsSL https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt update
sudo apt install mongodb-org
sudo systemctl status mongod - NOACTIVE
sudo systemctl start mongod.service
sudo systemctl status mongod - ACTIVE




3. ---------------------    "Nginx" ni serverga o'rnatish (saytda fayllani ishga tushirish  imkoniyatini beradi)
sudo apt update
sudo apt install nginx




4. ---------------------   "mc" ni serverga o'rnatish (fayllar bilan ishlash imkoniyatini beradi)
sudo apt update
sudo apt install mc




5. ---------------------   Serverda nginx ni sozlash va tahrirlash
nano /etc/nginx/sites-available/default
server {
    root /var/www/html;
    server_name 80.78.255.132 www.demo.uz ;
    location / {
    proxy_pass http://localhost:3000; #whatever port your app runs on
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

CTRL+X  =>   Y   =>   Enter -     saqlab qoyadi

systemctl restart nginx - obnavit berish



5. ---------------------    "pm2" ni serverga o'rnatish (server doim yoniq turishi uchun o'rnatish)
cd ../home
git clone https://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:x-oauth-basic@github.com/gargamelNodejs/it-house-server.git
npm install

npm install -g pm2
npm i pm2
pm2 start app.js
pm2 startup
pm2 save
pm2 monit






6. ---------------------------------   Loyihani serverga yuklash va ishga tushirish
git pull https://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:x-oauth-basic@github.com/gargamelNodejs/it-house-server.git
pm2 reload all
pm2 monit


sudo rm -r -f <folder or filename>   => serverda keraksiz papkalarni o'chirish
sudo mkdir <folder or filename>   => serverda  papkalarni yaratish

```
