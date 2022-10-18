import * as pulumi from "@pulumi/pulumi";
import * as yandex from "@pulumi/yandex";

export interface VpcArgs{
    folderId: string; 
    zoneList: ZoneList;
}

export interface ZoneList{
    [key: string]: pulumi.Input<string>[]
}

export default class Vpc extends pulumi.ComponentResource {
    vpc: yandex.VpcNetwork
    subnetIds: yandex.VpcSubnet[] = [];
    constructor(vpcName: string, vpcArgs: VpcArgs, opts?: pulumi.ComponentResourceOptions) {
        super("pulumi-contrib:components:YandexVPC", vpcName, {}, opts);

        this.vpc = new yandex.VpcNetwork(vpcName.toLowerCase(), {
             name: vpcName.toLowerCase(), 
             description: `Vpc "${vpcName}" created with pulumi project "${pulumi.getProject()}" in stack "${pulumi.getStack()}"`,
             labels: {
                "pulumi project": pulumi.getProject(),
                "pulumi stack": pulumi.getStack()
             },
             folderId: vpcArgs.folderId
            });

        for (const [zone, cidr] of Object.entries(vpcArgs.zoneList)) {
            const subnetName = `${vpcName.toLowerCase()}-${zone.toLowerCase()}`;
            const subnet = new yandex.VpcSubnet(`${vpcName}-${zone}`, {
                name: `${vpcName.toLowerCase()}-${zone.toLowerCase()}`,
                networkId: this.vpc.id,
                v4CidrBlocks: cidr,
                zone: zone,
                folderId: vpcArgs.folderId
    
            });
            this.subnetIds.push(subnet);
        }
        
    }
}