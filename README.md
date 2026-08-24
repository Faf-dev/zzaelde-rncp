Commande pour relancer gunicorn : sudo systemctl restart zzaelde-backend

commande pour transferer des dossier vers le vps (nettoie les fichiers) : rsync -avz --delete build/ ubuntu@zzaelde.com:/var/www/zzaelde/frontend/build/