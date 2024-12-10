:title Building a container cluster
:description Building my own container cluster.
:date 2025-1-10
:slug building-a-container-cluster
:category DevOps

In my [last post](/writing/building-a-compute-cluster) we explored creating a cluster of computers to run batch jobs with slurm. 
Now I want to repurpose the TuringPi cluster to set up my own kubernetes cluster to host long-running services.
Similar to slurm, I have been a consumer and user of products run on kubernetes and I want to dive a level deeper into running my own cluster.

Slurm is modeled around a queue of work to be done, while kubernetes is about packing containers onto a set of infrastructure.


TODO List:

* Prefect
* CI (instead of github actions)
* gitea (instead of github)
* docker registry
* Minio
* Redis
* Argo CI (for gitops?)
* Metallb
* Longhorn