//TODO:: - Add drop down menue to pick what IFC schema to use (now by default it's set to IFC4).
//TODO:: - What about levels? by default we are creating only one level and all elements are on it.

import {IfcAPI, IFC4, Schemas} from "web-ifc";
import { ModelState } from "./types";
import {Vector3} from 'three';
// import IfcStructuralPointConnection = IFC4.IfcStructuralPointConnection;

let modelId: number = 0,
    unitAssign: IFC4.IfcUnitAssignment, 
    geomContext: IFC4.IfcGeometricRepresentationContext;

const connectionsMapByIndex  = new Map<number,number>(),
      connectionsMapByVertex = new Map<number,number>(),
      membersMapByIndex      = new Map<number,number>(),
      IFCAPI                 = new IfcAPI();

export const exportIfc = (model: ModelState) => {

    // Events
    async function onTopBarExportIfcClick() {

        //TEMPORARY DATA
        const material: Material = {  
            name: 'Concrete', 
            propertySets: [{ 
                setName: 'Pset_MaterialCommon',
                properties: [{
                    name: 'MassDensity',
                    value: 0.284
                }]
            }]
        };
        const shape: recShape = {type: 'recShape', name: '', xDim: 300, yDim: 300};
        
        const binData: Uint8Array | undefined = await runExport(
            model.val.nodes,
            model.val.elements,
            material,
            shape
        );

        if (binData) {
            let blob = new Blob([binData], {type: 'application/x-step'});
            let a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = "model.ifc";
            a.click();
        }
    }

    const div = document.createElement('div');
    div.className = "topBar";
    let a = document.createElement('a');
    a.href = "#exportIfc";
    a.textContent = "Export IFC";
    a.addEventListener('click', onTopBarExportIfcClick);
    div.appendChild(a);
    return div;
};

type CShape = {
    type: 'CShape';
    name: string, 
    depth: number;
    width: number;
    wallThickness: number;
    girth: number;
    internalFilletRadius: number | null;
}

type IShape = {
    type: 'IShape';
    name: string, 
    overallWidth: number;
    overallDepth: number;
    webThickness: number;
    flangeThickness: number;
    filletRadius: number | null;
    flangeEdgeRadius: number | null;
    flangeSlope: number | null;
}

type LShape = {
    type: 'LShape';
    name: string, 
    depth: number;
    width: number | null;
    thickness: number;
    filletRadius: number | null;
    edgeRadius: number | null;
    legSlope: number | null;
}

type TShape = {
    type: 'TShape';
    name: string, 
    depth: number;
    flangeWidth: number;
    WebThickness: number;
    flangeThickness: number;
    filletRadius: number | null;
    flangeEdgeRadius: number | null;
    webEdgeRadius: number | null;
    webSlope: number | null;
    flangeSlope: number | null;
}

type UShape = {
    type: 'UShape';
    name: string, 
    depth: number;
    flangeWidth: number;
    webThickness: number;
    flangeThickness: number;
    filletRadius: number | null;
    edgeRadius: number | null;
    flangeSlope: number | null;
}

type ZShape = {
    type: 'ZShape';
    name: string, 
    depth: number;
    flangeWidth: number;
    webThickness: number;
    flangeThickness: number;
    filletRadius: number | null;
    edgeRadius: number | null;
}

type recShape = {
    type: 'recShape';
    name: string;
    xDim: number;
    yDim: number
}

type Material = {
    name: string;
    propertySets: [{
        setName: string;
        properties: [{ 
            name: string,
            value: number
        }]
    }]
}

type Shape = CShape | IShape | LShape | TShape | UShape | ZShape | recShape;

const runExport = async (
        nodes: Array<number>[], 
        elements: Array<number>[], 
        material?: Material,
        shape?: Shape,
        name?: string
    ): Promise<Uint8Array | undefined> => {
    
    try {
        await setupIfcBasis();
        const structuralModel = createStructuralModel(name);
        createPointConnections(nodes);
        createCurveMembers(elements);
        createIfcSpatialStructure();
        assignObjectsToModel(structuralModel); 

        //* Material and prfile creation
        if (material && shape){
            const ifcMaterial = createMaterial(material);
            createMaterialProfileForMembers(shape, ifcMaterial);
        }
    
        return IFCAPI.SaveModel(modelId);
    } catch (error) {
        console.error(error);
        return undefined;
    }
}


const createStructuralModel = (name?: string): IFC4.IfcStructuralAnalysisModel => {
    return new IFC4.IfcStructuralAnalysisModel(
        generateIfcGUID(),
        null,
        new IFC4.IfcLabel(name ? name : ''),
        new IFC4.IfcText(''),
        null,
        IFC4.IfcAnalysisModelTypeEnum.NOTDEFINED,
        null,null,null,null
    );
}

//* Core Data
const setupIfcBasis = async (): Promise<void> => {
    IFCAPI.SetWasmPath("https://unpkg.com/web-ifc@0.0.54/", true); 
    await IFCAPI.Init();

    const newIfcModel = {
        schema: Schemas.IFC4,
        name: 'Structural Model',
        description: ['IFC Structural Model created by Awatif.co'],
        authors: ['Awatif'],
        organizations: []
    }

    modelId = IFCAPI.CreateModel( newIfcModel );

    const org = new IFC4.IfcOrganization(
        null,
        new IFC4.IfcLabel('Awatif'),
        null, null, null
    )

    IFCAPI.WriteLine( modelId, org );

    const app = new IFC4.IfcApplication(
        org,
        new IFC4.IfcLabel('0.0.1'),
        new IFC4.IfcIdentifier('Awatif'),
        new IFC4.IfcIdentifier('')
    );

    IFCAPI.WriteLine( modelId, app );

    //* Units 
    const unit_1 = new IFC4.IfcSIUnit(
        IFC4.IfcUnitEnum.LENGTHUNIT,
        IFC4.IfcSIPrefix.MILLI,
        IFC4.IfcSIUnitName.METRE
    );

    unitAssign = new IFC4.IfcUnitAssignment(
        [unit_1]
    );

    IFCAPI.WriteLine( modelId, unitAssign );

    //* Geom rep
    const origin = [
        new IFC4.IfcLengthMeasure(0),
        new IFC4.IfcLengthMeasure(0),
        new IFC4.IfcLengthMeasure(0),
    ]

    const cartPoint = new IFC4.IfcCartesianPoint(origin)
    IFCAPI.WriteLine( modelId, cartPoint );

    origin[2].value = 1;

    const dir = new IFC4.IfcDirection(origin)

    IFCAPI.WriteLine( modelId, dir );

    const axis = new IFC4.IfcAxis2Placement3D(
        cartPoint,
        null,
        null
    )

    IFCAPI.WriteLine( modelId, axis );

    geomContext = new IFC4.IfcGeometricRepresentationContext(
        new IFC4.IfcLabel('3D'),
        new IFC4.IfcLabel('Model'),
        new IFC4.IfcDimensionCount(3),
        null,
        axis,
        dir
    )

    IFCAPI.WriteLine( modelId, geomContext );
}

const createIfcSpatialStructure = (): void => {
    // For experimental purposes, only one level will be created
    const proj = new IFC4.IfcProject(
        generateIfcGUID(),
        null,
        new IFC4.IfcLabel('project'),
        new IFC4.IfcText(''),
        null,null,null,
        [geomContext],
        unitAssign
    )

    IFCAPI.WriteLine( modelId, proj );

    const site = new IFC4.IfcSite(
        generateIfcGUID(),
        null,
        new IFC4.IfcLabel(''),
        new IFC4.IfcText(''),
        null,null,null,null,null,null,null,null,null,null
    );
    IFCAPI.WriteLine( modelId, site);

    let relAggr = new IFC4.IfcRelAggregates(
        generateIfcGUID(),
        null,null,null,
        proj,
        [site]
    );

    IFCAPI.WriteLine( modelId, relAggr );

    const building = new IFC4.IfcBuilding(
        generateIfcGUID(),
        null,
        new IFC4.IfcLabel(''),
        new IFC4.IfcText(''),
        null,
        null,null,null,null,null,null,null
    );

    IFCAPI.WriteLine( modelId,building );

    relAggr.expressID = IFCAPI.GetMaxExpressID(modelId) + 1;
    relAggr.GlobalId = generateIfcGUID();
    relAggr.RelatedObjects = [building];
    relAggr.RelatingObject = site;

    IFCAPI.WriteLine( modelId, relAggr );

    const buildingStorey = new IFC4.IfcBuildingStorey(
        generateIfcGUID(),
        null,
        new IFC4.IfcLabel('Level 0'),
        new IFC4.IfcText(''),
        null,null,null,null,null,
        new IFC4.IfcPositiveLengthMeasure(0)
    );

    IFCAPI.WriteLine( modelId,buildingStorey );

    relAggr.expressID =  IFCAPI.GetMaxExpressID(modelId) + 1;
    relAggr.GlobalId = generateIfcGUID();
    relAggr.RelatedObjects = [buildingStorey];
    relAggr.RelatingObject = building;

    IFCAPI.WriteLine( modelId, relAggr );

    //Attach members to building story
    IFCAPI.WriteLine( modelId, new IFC4.IfcRelContainedInSpatialStructure(
        generateIfcGUID(),
        null, null, null,
        Array.from(membersMapByIndex.values()).map((id) => {
            return IFCAPI.GetLine(modelId, id);
        }),
        buildingStorey
    ))
}

//* Structural model
const createPointConnections = (nodes: Array<number>[]): void => {
    for (let i = 0; i < nodes.length; i++) {
        let connection = generateConnection(nodes[i], i);
        connectionsMapByIndex.set(i, connection.expressID);
        IFCAPI.WriteLine(modelId, connection);
    }
} 

const generateConnection = (position: number[], index: number): IFC4.IfcStructuralPointConnection => {

    const factor = 1000; // hard coded for now from m to mm
    //* IFCCARTESIANPOINT
    const point = new IFC4.IfcCartesianPoint([
        new IFC4.IfcLengthMeasure(position[0] * factor),
        new IFC4.IfcLengthMeasure(position[1] * factor),
        new IFC4.IfcLengthMeasure(position[2] * factor)
    ])

    //* IFCVERTEXPOINT
    const vertex = new IFC4.IfcVertexPoint(point);

    //* IFCTOPOLOGYREPRESENTATION
    const topoRep = new IFC4.IfcTopologyRepresentation(
        geomContext,
        new IFC4.IfcLabel('Reference'),
        new IFC4.IfcLabel('Vertex'),
        [vertex]
    )

    //* IFCPRODUCTDEFINITIONSHAPE
    const productDefShape = new IFC4.IfcProductDefinitionShape(
        null,null,
        [topoRep]
    )

    //* IFCBOUNDARYNODECONDITION
    const boundCondition = new IFC4.IfcBoundaryNodeCondition(
        // new IFC4.IfcLabel('Fixed'),
        null, 
        new IFC4.IfcBoolean('T'), new IFC4.IfcBoolean('T'),
        new IFC4.IfcBoolean('T'), new IFC4.IfcBoolean('T'),
        new IFC4.IfcBoolean('T'), new IFC4.IfcBoolean('T')
    )

    //* IFCSTRUCTURALPOINTCONNECTION
    const connection = new IFC4.IfcStructuralPointConnection(
        generateIfcGUID(),
        null,
        new IFC4.IfcLabel(`${index+1}`),
        new IFC4.IfcText(''),
        null, null,
        productDefShape,
        boundCondition,
        null
    )
    IFCAPI.WriteLine( modelId, connection );
    connectionsMapByVertex.set(connection.expressID, vertex.expressID);
    return connection;
}

const createCurveMembers = (elements: Array<number>[]): void => {
    for (let i = 0; i < elements.length; i++){
        let member = generateMember(elements[i], i);
        if (member){
            membersMapByIndex.set(i, member.expressID);
            IFCAPI.WriteLine(modelId, member);
        }
    }
}

const generateMember = (element: number[], index: number) => {

    let connexIdx1 = connectionsMapByIndex.get(element[0]);
    let connexIdx2 = connectionsMapByIndex.get(element[1]);

    if ( !connexIdx1 || !connexIdx2) return;

    let connex1 = connectionsMapByVertex.get(connexIdx1);
    let connex2 = connectionsMapByVertex.get(connexIdx2);
    
    if ( !connex1 || !connex2) return;

    const p1 = IFCAPI.GetLine(modelId, connex1);
    const p2 = IFCAPI.GetLine(modelId, connex2);

    //* Compute direction
    const coord1 = IFCAPI.GetLine(modelId, p1.VertexGeometry.value).Coordinates;
    const coord2 = IFCAPI.GetLine(modelId, p2.VertexGeometry.value).Coordinates;
    const v1 = new Vector3(coord1[0].value, coord1[1].value, coord1[2].value)
    const v2 = new Vector3(coord2[0].value, coord2[1].value, coord2[2].value)

    let d = v1.multiply(v2).normalize();

    if (v1.length() == 0)
        d = new Vector3(1,1,1).multiply(v2).normalize();
    else if (v2.length() == 0) 
        d = new Vector3(1,1,1).multiply(v1).normalize();

    console.log('[Vectors]:', v1, v2)
    console.log('[Mult]:', d)


    const direction = new IFC4.IfcDirection( [
        new IFC4.IfcLengthMeasure(d.x),
        new IFC4.IfcLengthMeasure(d.y),
        new IFC4.IfcLengthMeasure(d.z)
    ]);

    const edge = new IFC4.IfcEdge(p1, p2);
    const topoRep = new IFC4.IfcTopologyRepresentation(
        geomContext,
        new IFC4.IfcLabel('Reference'),
        new IFC4.IfcLabel('Edge'),
        [edge]
    );

    const productDefShape = new IFC4.IfcProductDefinitionShape(
        null, null,
        [topoRep]
    );

    const member = new IFC4.IfcStructuralCurveMember(
        generateIfcGUID(),
        null,
        new IFC4.IfcLabel(`${index+1}`),
        new IFC4.IfcText(''),
        null,
        null,
        productDefShape,
        IFC4.IfcStructuralCurveMemberTypeEnum.RIGID_JOINED_MEMBER,
        direction
    )

    const memberConnectsRel1 = new IFC4.IfcRelConnectsStructuralMember(
        generateIfcGUID(),
        null,
        new IFC4.IfcLabel(''),
        new IFC4.IfcText(''),
        member,
        IFCAPI.GetLine(modelId, connexIdx1),
        null,null,null,null
    )

    const memberConnectsRel2 = new IFC4.IfcRelConnectsStructuralMember(
        generateIfcGUID(),
        null,
        new IFC4.IfcLabel(''),
        new IFC4.IfcText(''),
        member,
        IFCAPI.GetLine(modelId, connexIdx2),
        null,null,null,null
    )

    IFCAPI.WriteLine(modelId, memberConnectsRel1);
    IFCAPI.WriteLine(modelId, memberConnectsRel2);

    return member;
    // return {rel1: memberConnectsRel1, rel2: memberConnectsRel2}
}

const assignObjectsToModel = (model: IFC4.IfcStructuralAnalysisModel) => {
    const relObjs = [];

    const relObjsIds = Array.from(connectionsMapByIndex.values()).concat(Array.from(membersMapByIndex.values()));
    for (let i = 0; i < relObjsIds.length; i++)
        relObjs.push(IFCAPI.GetLine(modelId, relObjsIds[i]));

    const rel = assignRelationToGroup(model, relObjs);
    IFCAPI.WriteLine(modelId, rel);
}

const assignRelationToGroup = (object: any, relatedObjs: any[]): IFC4.IfcRelAssignsToGroup => {
    return new IFC4.IfcRelAssignsToGroup(
        generateIfcGUID(),
        null, null, null,
        relatedObjs,
        IFC4.IfcObjectTypeEnum.NOTDEFINED,
        object
    )
}

//* Materials
const createMaterial = (material: Material): IFC4.IfcMaterial => {
    const mat = new IFC4.IfcMaterial(
        new IFC4.IfcLabel(material.name),
        null, null
    );
    
    for (let i = 0; i < material.propertySets.length; i++) {
        const props: IFC4.IfcPropertySingleValue[] = [];
        const pSet = material.propertySets[i];
        
        for (let j = 0; j < pSet.properties.length; j++) {
            const p = pSet.properties[j];
    
            props.push( new IFC4.IfcPropertySingleValue(
    
                new IFC4.IfcIdentifier(p.name),
                null,
                new IFC4.IfcMassDensityMeasure(p.value),
                null
            ));
        }

        const matPropsSet = new IFC4.IfcMaterialProperties(

            new IFC4.IfcIdentifier(pSet.setName),
            null,
            props,
            mat
        );
    
        IFCAPI.WriteLine(modelId, matPropsSet);

    }

    return mat;
}

const createMaterialProfileForMembers = (
        shape: Shape,
        material: IFC4.IfcMaterial,
        profileName: string = ''
    ): void => {

    let profile: IFC4.IfcProfileDef | undefined = undefined;

    switch (shape.type) {
        case 'CShape':
            profile = new IFC4.IfcCShapeProfileDef(
                IFC4.IfcProfileTypeEnum.AREA,
                new IFC4.IfcLabel(profileName),
                null,
                new IFC4.IfcPositiveLengthMeasure(shape.depth),
                new IFC4.IfcPositiveLengthMeasure(shape.width),
                new IFC4.IfcPositiveLengthMeasure(shape.wallThickness),
                new IFC4.IfcPositiveLengthMeasure(shape.girth),
                shape.internalFilletRadius ? new IFC4.IfcNonNegativeLengthMeasure(Math.abs(shape.internalFilletRadius)) : null
            )
            break;
        case 'IShape':
            profile = new IFC4.IfcIShapeProfileDef(
                IFC4.IfcProfileTypeEnum.AREA,
                new IFC4.IfcLabel(profileName),
                null,
                new IFC4.IfcPositiveLengthMeasure(shape.overallWidth),
                new IFC4.IfcPositiveLengthMeasure(shape.overallDepth),
                new IFC4.IfcPositiveLengthMeasure(shape.webThickness),
                new IFC4.IfcPositiveLengthMeasure(shape.flangeThickness),
                shape.filletRadius ? new IFC4.IfcNonNegativeLengthMeasure(Math.abs(shape.filletRadius)) : null,
                shape.flangeEdgeRadius ? new IFC4.IfcNonNegativeLengthMeasure(Math.abs(shape.flangeEdgeRadius)) : null,
                new IFC4.IfcPlaneAngleMeasure(shape.flangeSlope)
            )
            break;
        case 'LShape':
            profile = new IFC4.IfcLShapeProfileDef(
                IFC4.IfcProfileTypeEnum.AREA,
                new IFC4.IfcLabel(profileName),
                null,
                new IFC4.IfcPositiveLengthMeasure(shape.depth),
                new IFC4.IfcPositiveLengthMeasure(shape.width),
                new IFC4.IfcPositiveLengthMeasure(shape.thickness),
                shape.filletRadius ? new IFC4.IfcNonNegativeLengthMeasure(Math.abs(shape.filletRadius)) : null,
                shape.edgeRadius ? new IFC4.IfcNonNegativeLengthMeasure(Math.abs(shape.edgeRadius)) : null,
                new IFC4.IfcPlaneAngleMeasure(shape.legSlope)
            )
            break;
        case 'TShape':
            profile = new IFC4.IfcTShapeProfileDef(
                IFC4.IfcProfileTypeEnum.AREA,
                new IFC4.IfcLabel(profileName),
                null,
                new IFC4.IfcPositiveLengthMeasure(shape.depth),
                new IFC4.IfcPositiveLengthMeasure(shape.flangeWidth),
                new IFC4.IfcPositiveLengthMeasure(shape.WebThickness),
                new IFC4.IfcPositiveLengthMeasure(shape.flangeThickness),
                shape.filletRadius ? new IFC4.IfcNonNegativeLengthMeasure(Math.abs(shape.filletRadius)) : null,
                shape.flangeEdgeRadius ? new IFC4.IfcNonNegativeLengthMeasure(Math.abs(shape.flangeEdgeRadius)) : null,
                shape.webEdgeRadius ? new IFC4.IfcNonNegativeLengthMeasure(Math.abs(shape.webEdgeRadius)) : null,
                new IFC4.IfcPlaneAngleMeasure(shape.webSlope),
                new IFC4.IfcPlaneAngleMeasure(shape.flangeSlope)
            )
            break;
        case 'UShape':
            profile = new IFC4.IfcUShapeProfileDef(
                IFC4.IfcProfileTypeEnum.AREA,
                new IFC4.IfcLabel(profileName),
                null,
                new IFC4.IfcPositiveLengthMeasure(shape.depth),
                new IFC4.IfcPositiveLengthMeasure(shape.flangeWidth),
                new IFC4.IfcPositiveLengthMeasure(shape.webThickness),
                new IFC4.IfcPositiveLengthMeasure(shape.flangeThickness),
                shape.filletRadius ? new IFC4.IfcNonNegativeLengthMeasure(Math.abs(shape.filletRadius)) : null,
                shape.edgeRadius ? new IFC4.IfcNonNegativeLengthMeasure(Math.abs(shape.edgeRadius)) : null,
                new IFC4.IfcPlaneAngleMeasure(shape.flangeSlope)
            )
            break;
        case 'ZShape':
            profile = new IFC4.IfcZShapeProfileDef(
                IFC4.IfcProfileTypeEnum.AREA,
                new IFC4.IfcLabel(profileName),
                null,
                new IFC4.IfcPositiveLengthMeasure(shape.depth),
                new IFC4.IfcPositiveLengthMeasure(shape.flangeWidth),
                new IFC4.IfcPositiveLengthMeasure(shape.webThickness),
                new IFC4.IfcPositiveLengthMeasure(shape.flangeThickness),
                shape.filletRadius ? new IFC4.IfcNonNegativeLengthMeasure(Math.abs(shape.filletRadius)) : null,
                shape.edgeRadius ? new IFC4.IfcNonNegativeLengthMeasure(Math.abs(shape.edgeRadius)) : null
            )
            break;
        case 'recShape':
            profile = new IFC4.IfcRectangleProfileDef(
                IFC4.IfcProfileTypeEnum.AREA,
                new IFC4.IfcLabel(profileName),
                null,
                new IFC4.IfcPositiveLengthMeasure(shape.xDim),
                new IFC4.IfcPositiveLengthMeasure(shape.yDim),
            )
            break;

        default:
            break;
    }

    if (!profile) return;
    const materialProfile = new IFC4.IfcMaterialProfile(
        null, null, 
        material, 
        profile, 
        null, null
    );

    const materialSet = new IFC4.IfcMaterialProfileSet(
        null, null, [materialProfile],
        null
    )

    const materialSetUsage = new IFC4.IfcMaterialProfileSetUsage(
        materialSet,
        null, null
    )

    const rel = new IFC4.IfcRelAssociatesMaterial(
        generateIfcGUID(),
        null, null, null, 
        Array.from(membersMapByIndex.values()).map((id) => {
            return IFCAPI.GetLine(modelId, id);
        }),
        materialSetUsage
    )

    IFCAPI.WriteLine(modelId, rel);
}

const generateUUID = () => {
    const _lut = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '5b', '5c', '5d', '5e', '5f', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff'];

    const d0 = Math.random() * 0xffffffff | 0;
    const d1 = Math.random() * 0xffffffff | 0;
    const d2 = Math.random() * 0xffffffff | 0;
    const d3 = Math.random() * 0xffffffff | 0;
    const uuid = _lut[d0 & 0xff] + _lut[d0 >> 8 & 0xff] + _lut[d0 >> 16 & 0xff] + _lut[d0 >> 24 & 0xff] + '-' +
        _lut[d1 & 0xff] + _lut[d1 >> 8 & 0xff] + '-' + _lut[d1 >> 16 & 0x0f | 0x40] + _lut[d1 >> 24 & 0xff] + '-' +
        _lut[d2 & 0x3f | 0x80] + _lut[d2 >> 8 & 0xff] + '-' + _lut[d2 >> 16 & 0xff] + _lut[d2 >> 24 & 0xff] +
        _lut[d3 & 0xff] + _lut[d3 >> 8 & 0xff] + _lut[d3 >> 16 & 0xff] + _lut[d3 >> 24 & 0xff];

    // .toLowerCase() here flattens concatenated strings to save heap memory space.
    return uuid.toLowerCase();
}

const generateIfcGUID = () : IFC4.IfcGloballyUniqueId => {
    // prettier-ignore
    const base64Chars = [
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H",
        "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r",
        "s", "t", "u", "v", "w", "x", "y", "z", "_", "$",
    ];
    const guid = generateUUID();
    const tailBytes = ((guid) => {
        const bytes: any = [];
        guid.split("-").map((number) => {
            const bytesInChar = number.match(/.{1,2}/g);
            if (bytesInChar) {
                return bytesInChar.map((byte) => bytes.push(parseInt(byte, 16)));
            }
            return null;
        });
        return bytes;
    })(guid);
    const headBytes = ((guid) => {
        const bytes: any = [];
        guid.split("-").map((number) => {
            const bytesInChar = number.match(/.{1,2}/g);
            if (bytesInChar) {
                return bytesInChar.map((byte) => bytes.push(byte));
            }
            return null;
        });
        return bytes;
    })(guid);
    const cvTo64 = (number: any, result: any, start: any, len: any) => {
        let num = number;
        const n = len;
        let i;
        for (i = 0; i < n; i += 1) {
            result[start + len - i - 1] =
                base64Chars[parseInt((num % 64).toString(), 10)];
            num /= 64;
        }
        return result;
    };
    const toUInt16 = (bytes: any, index: any) =>
        // eslint-disable-next-line no-bitwise
        parseInt(bytes.slice(index, index + 2).reduce((str: any, v: any) => str + v, ""), 16) >>> 0;
    const toUInt32 = (bytes: any, index: any) =>
        // eslint-disable-next-line no-bitwise
        parseInt(bytes.slice(index, index + 4).reduce((str: any, v: any) => str + v, ""), 16) >>> 0;
    const num = [];
    let str = [];
    let i;
    let n = 2;
    let pos = 0;
    num[0] = toUInt32(headBytes, 0) / 16777216;
    num[1] = toUInt32(headBytes, 0) % 16777216;
    // eslint-disable-next-line no-bitwise
    num[2] = (toUInt16(headBytes, 4) * 256 + toUInt16(headBytes, 6) / 256) >>> 0;
    num[3] =
        // eslint-disable-next-line no-bitwise
        ((toUInt16(headBytes, 6) % 256) * 65536 +
            tailBytes[8] * 256 +
            tailBytes[9]) >>>
        0;
    // eslint-disable-next-line no-bitwise
    num[4] = (tailBytes[10] * 65536 + tailBytes[11] * 256 + tailBytes[12]) >>> 0;
    // eslint-disable-next-line no-bitwise
    num[5] = (tailBytes[13] * 65536 + tailBytes[14] * 256 + tailBytes[15]) >>> 0;
    for (i = 0; i < 6; i++) {
        str = cvTo64(num[i], str, pos, n);
        pos += n;
        n = 4;
    }
    return new IFC4.IfcGloballyUniqueId(str.join(""));
}